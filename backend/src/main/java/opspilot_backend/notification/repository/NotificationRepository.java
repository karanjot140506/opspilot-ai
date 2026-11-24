
package opspilot_backend.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import opspilot_backend.notification.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByRecipient_IdAndReadFalseOrderByCreatedAtDesc(
            Long recipientId
    );

    long countByRecipient_IdAndReadFalse(Long recipientId);
}
