
package opspilot_backend.incident.service;

import opspilot_backend.incident.entity.Incident;
import opspilot_backend.incident.repository.IncidentRepository;
import opspilot_backend.incident.activity.service.IncidentActivityService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

import opspilot_backend.team.entity.TeamMember;
import opspilot_backend.team.repository.TeamMemberRepository;

@Service
public class IncidentService {

        private final IncidentRepository incidentRepository;
        private final IncidentActivityService activityService;
        private final TeamMemberRepository teamMemberRepository;

        public IncidentService(
                        IncidentRepository incidentRepository,
                        IncidentActivityService activityService,
                        TeamMemberRepository teamMemberRepository) {
                this.incidentRepository = incidentRepository;
                this.activityService = activityService;
                this.teamMemberRepository = teamMemberRepository;
        }

        @Transactional
        public Incident createIncident(Incident incident) {
                OffsetDateTime now = OffsetDateTime.now();

                incident.setId(null);
                incident.setStatus("OPEN");
                incident.setCreatedAt(now);
                incident.setUpdatedAt(now);

                incident.setResponseDueAt(
                                switch (incident.getPriority()) {
                                        case "CRITICAL" -> now.plusMinutes(5);
                                        case "HIGH" -> now.plusMinutes(15);
                                        case "MEDIUM" -> now.plusHours(1);
                                        case "LOW" -> now.plusHours(4);
                                        default -> throw new IllegalArgumentException("Invalid incident priority");
                                });

                incident.setResolutionDueAt(
                                switch (incident.getPriority()) {
                                        case "CRITICAL" -> now.plusHours(1);
                                        case "HIGH" -> now.plusHours(4);
                                        case "MEDIUM" -> now.plusHours(8);
                                        case "LOW" -> now.plusHours(24);
                                        default -> throw new IllegalArgumentException("Invalid incident priority");
                                });

                Incident savedIncident = incidentRepository.save(incident);

                activityService.recordActivity(
                                savedIncident.getId(),
                                "CREATED",
                                "Incident created: " + savedIncident.getTitle(),
                                null,
                                null);

                return savedIncident;
        }

        @Transactional
        public Incident assignIncident(Long incidentId, Long teamMemberId) {

                Incident incident = incidentRepository.findById(incidentId)
                                .orElseThrow(() -> new IncidentNotFoundException(incidentId));

                TeamMember member = teamMemberRepository.findById(teamMemberId)
                                .orElseThrow(() -> new IllegalArgumentException("Team member not found"));

                Long oldAssigneeId = incident.getAssignedToId();

                if (oldAssigneeId != null && oldAssigneeId.equals(teamMemberId)) {
                        return incident;
                }

                incident.setAssignedToId(teamMemberId);
                incident.setUpdatedAt(OffsetDateTime.now());

                Incident savedIncident = incidentRepository.save(incident);

                activityService.recordActivity(
                                incidentId,
                                "ASSIGNED",
                                "Incident assigned to " + member.getName(),
                                oldAssigneeId == null ? null : oldAssigneeId.toString(),
                                teamMemberId.toString());

                return savedIncident;
        }

        @Transactional(readOnly = true)
        public List<Incident> getAllIncidents() {
                return incidentRepository.findAll();
        }

        @Transactional(readOnly = true)
        public Incident getIncidentById(Long id) {
                return incidentRepository.findById(id)
                                .orElseThrow(() -> new IncidentNotFoundException(id));
        }

        @Transactional
        public Incident updateIncidentStatus(Long id, String newStatus) {
                Incident incident = incidentRepository.findById(id)
                                .orElseThrow(() -> new IncidentNotFoundException(id));

                if (newStatus == null ||
                                !List.of("OPEN", "IN_PROGRESS", "RESOLVED")
                                                .contains(newStatus.trim().toUpperCase())) {
                        throw new IllegalArgumentException(
                                        "Invalid status. Allowed values: OPEN, IN_PROGRESS, RESOLVED");
                }

                String oldStatus = incident.getStatus();
                String updatedStatus = newStatus.trim().toUpperCase();

                if (oldStatus.equals(updatedStatus)) {
                        return incident;
                }

                // Record the first response time only once
                if ("IN_PROGRESS".equals(updatedStatus)
                                && incident.getFirstResponseAt() == null) {
                        incident.setFirstResponseAt(OffsetDateTime.now());
                }

                // Record the resolution time
                if ("RESOLVED".equals(updatedStatus)) {
                        incident.setResolvedAt(OffsetDateTime.now());
                }

                incident.setStatus(updatedStatus);
                incident.setUpdatedAt(OffsetDateTime.now());

                Incident savedIncident = incidentRepository.save(incident);

                activityService.recordActivity(
                                savedIncident.getId(),
                                "STATUS_CHANGED",
                                "Status changed from " + oldStatus + " to " + updatedStatus,
                                oldStatus,
                                updatedStatus);

                return savedIncident;
        }

        @Transactional
        public Incident updateIncidentPriority(Long id, String newPriority) {

                Incident incident = incidentRepository.findById(id)
                                .orElseThrow(() -> new IncidentNotFoundException(id));

                if (newPriority == null ||
                                !List.of("CRITICAL", "HIGH", "MEDIUM", "LOW")
                                                .contains(newPriority.trim().toUpperCase())) {

                        throw new IllegalArgumentException(
                                        "Invalid priority. Allowed values: CRITICAL, HIGH, MEDIUM, LOW");
                }

                String oldPriority = incident.getPriority();
                String updatedPriority = newPriority.trim().toUpperCase();

                if (oldPriority.equals(updatedPriority)) {
                        return incident;
                }

                incident.setPriority(updatedPriority);
                incident.setUpdatedAt(OffsetDateTime.now());

                Incident savedIncident = incidentRepository.save(incident);

                activityService.recordActivity(
                                savedIncident.getId(),
                                "PRIORITY_CHANGED",
                                "Priority changed from " + oldPriority + " to " + updatedPriority,
                                oldPriority,
                                updatedPriority);

                return savedIncident;
        }

        public String getSlaStatus(Incident incident) {

                OffsetDateTime now = OffsetDateTime.now();

                if ("RESOLVED".equals(incident.getStatus())) {
                        return "COMPLETED";
                }

                if (incident.getResolvedAt() != null) {
                        return "COMPLETED";
                }

                if (incident.getResolutionDueAt() != null
                                && now.isAfter(incident.getResolutionDueAt())) {
                        return "BREACHED";
                }

                if (incident.getResponseDueAt() != null
                                && incident.getFirstResponseAt() == null
                                && now.isAfter(incident.getResponseDueAt())) {
                        return "BREACHED";
                }

                if (incident.getResolutionDueAt() != null
                                && now.plusMinutes(30).isAfter(incident.getResolutionDueAt())) {
                        return "AT_RISK";
                }

                return "ON_TRACK";
        }

        @Transactional
        public void escalateIncident(Incident incident) {

                if ("RESOLVED".equals(incident.getStatus())) {
                        return;
                }

                Integer currentLevel = incident.getEscalationLevel();

                if (currentLevel == null) {
                        currentLevel = 0;
                }

                if (currentLevel >= 3) {
                        return;
                }

                String oldPriority = incident.getPriority();
                String newPriority;

                switch (oldPriority) {
                        case "LOW" -> newPriority = "MEDIUM";
                        case "MEDIUM" -> newPriority = "HIGH";
                        case "HIGH" -> newPriority = "CRITICAL";
                        default -> {
                                return;
                        }
                }

                incident.setPriority(newPriority);
                incident.setEscalationLevel(currentLevel + 1);
                incident.setUpdatedAt(OffsetDateTime.now());

                Incident savedIncident = incidentRepository.save(incident);

                activityService.recordActivity(
                                savedIncident.getId(),
                                "ESCALATED",
                                "Incident automatically escalated from "
                                                + oldPriority + " to " + newPriority,
                                oldPriority,
                                newPriority);
        }
}
