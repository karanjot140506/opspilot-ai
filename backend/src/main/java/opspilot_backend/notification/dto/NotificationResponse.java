
package opspilot_backend.notification.dto;

import java.time.OffsetDateTime;

import opspilot_backend.notification.entity.Notification;

public record NotificationResponse(
        Long id,
        Long incidentId,
        String incidentTitle,
        Long recipientTeamMemberId,
        String type,
        String title,
        String message,
        boolean read,
        OffsetDateTime createdAt
) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getIncident() != null
                        ? notification.getIncident().getId() : null,
                notification.getIncident() != null
                        ? notification.getIncident().getTitle() : null,
                notification.getRecipient() != null
                        ? notification.getRecipient().getId() : null,
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
