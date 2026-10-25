package opspilot_backend.incident.repository;

import opspilot_backend.incident.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
}
