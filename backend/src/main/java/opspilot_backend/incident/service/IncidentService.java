package opspilot_backend.incident.service;

import opspilot_backend.incident.entity.Incident;
import opspilot_backend.incident.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Transactional
    public Incident createIncident(Incident incident) {
        OffsetDateTime now = OffsetDateTime.now();

        incident.setId(null);
        incident.setStatus("OPEN");
        incident.setCreatedAt(now);
        incident.setUpdatedAt(now);

        return incidentRepository.save(incident);
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

    incident.setStatus(newStatus.trim().toUpperCase());
    incident.setUpdatedAt(OffsetDateTime.now());

    return incidentRepository.save(incident);
}

}

