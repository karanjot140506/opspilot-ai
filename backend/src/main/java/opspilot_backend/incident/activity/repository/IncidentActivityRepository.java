
package opspilot_backend.incident.activity.repository;

import opspilot_backend.incident.activity.entity.IncidentActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentActivityRepository
        extends JpaRepository<IncidentActivity, Long> {

    List<IncidentActivity> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}
