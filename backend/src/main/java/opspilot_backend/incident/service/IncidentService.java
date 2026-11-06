
package opspilot_backend.incident.service;

import opspilot_backend.incident.entity.Incident;
import opspilot_backend.incident.repository.IncidentRepository;
import opspilot_backend.incident.activity.service.IncidentActivityService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentActivityService activityService;

    public IncidentService(
            IncidentRepository incidentRepository,
            IncidentActivityService activityService) {
        this.incidentRepository = incidentRepository;
        this.activityService = activityService;
    }

    @Transactional
    public Incident createIncident(Incident incident) {
        OffsetDateTime now = OffsetDateTime.now();

        incident.setId(null);
        incident.setStatus("OPEN");
        incident.setCreatedAt(now);
        incident.setUpdatedAt(now);

        Incident savedIncident = incidentRepository.save(incident);

        activityService.recordActivity(
                savedIncident.getId(),
                "CREATED",
                "Incident created: " + savedIncident.getTitle(),
                null,
                null
        );

        return savedIncident;
    }

    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() ->
                        new IncidentNotFoundException(id));
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

    incident.setStatus(updatedStatus);
    incident.setUpdatedAt(OffsetDateTime.now());

    Incident savedIncident = incidentRepository.save(incident);

    activityService.recordActivity(
            savedIncident.getId(),
            "STATUS_CHANGED",
            "Status changed from " + oldStatus + " to " + updatedStatus,
            oldStatus,
            updatedStatus
    );

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
            updatedPriority
    );

    return savedIncident;
}

}
