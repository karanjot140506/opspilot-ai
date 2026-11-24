
package opspilot_backend.notification.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import opspilot_backend.incident.entity.Incident;
import opspilot_backend.notification.dto.NotificationResponse;
import opspilot_backend.notification.entity.Notification;
import opspilot_backend.notification.repository.NotificationRepository;
import opspilot_backend.team.entity.TeamMember;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(
            Incident incident,
            TeamMember recipient,
            String type,
            String title,
            String message) {

        Notification notification = new Notification();

        notification.setIncident(incident);
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(OffsetDateTime.now());

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long recipientId) {
        return notificationRepository
                .findByRecipient_IdOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(
            Long recipientId) {
        return notificationRepository
                .findByRecipient_IdAndReadFalseOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId) {
        return notificationRepository
                .countByRecipient_IdAndReadFalse(recipientId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Notification not found"));

        notification.setRead(true);
    }

    @Transactional
    public void markAllAsRead(Long recipientId) {
        List<Notification> notifications = notificationRepository
                .findByRecipient_IdAndReadFalseOrderByCreatedAtDesc(recipientId);

        notifications.forEach(notification -> notification.setRead(true));
    }
}
