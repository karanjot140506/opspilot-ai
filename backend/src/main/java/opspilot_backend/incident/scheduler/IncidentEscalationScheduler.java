package opspilot_backend.incident.scheduler;

import opspilot_backend.incident.entity.Incident;
import opspilot_backend.incident.repository.IncidentRepository;
import opspilot_backend.incident.service.IncidentService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class IncidentEscalationScheduler {

    private final IncidentRepository incidentRepository;
    private final IncidentService incidentService;

    public IncidentEscalationScheduler(
            IncidentRepository incidentRepository,
            IncidentService incidentService) {
        this.incidentRepository = incidentRepository;
        this.incidentService = incidentService;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkOverdueIncidents() {

        List<Incident> overdueIncidents =
        incidentRepository.findByStatusNotAndResolutionDueAtBeforeAndEscalationLevel(
                "RESOLVED",
                OffsetDateTime.now(),
                0);

        for (Incident incident : overdueIncidents) {
            incidentService.escalateIncident(incident);
        }
    }
}