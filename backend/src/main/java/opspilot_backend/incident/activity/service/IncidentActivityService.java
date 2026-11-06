
package opspilot_backend.incident.activity.service;

import opspilot_backend.incident.activity.entity.IncidentActivity;
import opspilot_backend.incident.activity.repository.IncidentActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class IncidentActivityService {

    private final IncidentActivityRepository activityRepository;

    public IncidentActivityService(
            IncidentActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional
    public IncidentActivity recordActivity(
            Long incidentId,
            String action,
            String description,
            String oldValue,
            String newValue) {

        IncidentActivity activity = new IncidentActivity();

        activity.setIncidentId(incidentId);
        activity.setAction(action);
        activity.setDescription(description);
        activity.setOldValue(oldValue);
        activity.setNewValue(newValue);
        activity.setCreatedAt(OffsetDateTime.now());

        return activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<IncidentActivity> getActivities(Long incidentId) {
        return activityRepository
                .findByIncidentIdOrderByCreatedAtDesc(incidentId);
    }
}
