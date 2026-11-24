
package opspilot_backend.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import opspilot_backend.notification.dto.NotificationResponse;
import opspilot_backend.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestParam Long recipientId) {
        return ResponseEntity.ok(
                notificationService.getNotifications(recipientId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @RequestParam Long recipientId) {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(recipientId));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestParam Long recipientId) {
        return ResponseEntity.ok(
                notificationService.getUnreadCount(recipientId));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam Long recipientId) {
        notificationService.markAllAsRead(recipientId);
        return ResponseEntity.noContent().build();
    }
}

