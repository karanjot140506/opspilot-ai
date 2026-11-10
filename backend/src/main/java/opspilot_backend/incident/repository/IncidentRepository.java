package opspilot_backend.incident.repository;

import opspilot_backend.incident.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByStatusNotAndResolutionDueAtBeforeAndEscalationLevel(
            String status,
            OffsetDateTime now,
            Integer escalationLevel);
}