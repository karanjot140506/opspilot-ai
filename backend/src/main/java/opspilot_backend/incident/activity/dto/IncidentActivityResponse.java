
package opspilot_backend.incident.activity.dto;

import opspilot_backend.incident.activity.entity.IncidentActivity;

import java.time.OffsetDateTime;

public record IncidentActivityResponse(
        Long id,
        Long incidentId,
        String action,
        String description,
        String oldValue,
        String newValue,
        OffsetDateTime createdAt
) {

    public static IncidentActivityResponse from(
            IncidentActivity activity) {

        return new IncidentActivityResponse(
                activity.getId(),
                activity.getIncidentId(),
                activity.getAction(),
                activity.getDescription(),
                activity.getOldValue(),
                activity.getNewValue(),
                activity.getCreatedAt()
        );
    }
}
