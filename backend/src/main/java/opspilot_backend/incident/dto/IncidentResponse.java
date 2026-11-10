
package opspilot_backend.incident.dto;

import opspilot_backend.incident.entity.Incident;
import java.time.OffsetDateTime;

public record IncidentResponse(
        Long id,
        String title,
        String description,
        String severity,
        String status,
        String priority,
        String serviceName,
        Long assignedToId,
        String slaStatus,
        Integer escalationLevel,
        OffsetDateTime responseDueAt,
        OffsetDateTime resolutionDueAt,
        OffsetDateTime firstResponseAt,
        OffsetDateTime resolvedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
    public static IncidentResponse from(Incident incident,  String slaStatus) {
        return new IncidentResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getSeverity(),
                incident.getStatus(),
                
                incident.getPriority(),
                incident.getServiceName(),
                incident.getAssignedToId(),
                slaStatus,
                incident.getEscalationLevel(),
                incident.getResponseDueAt(),
                incident.getResolutionDueAt(),
                incident.getFirstResponseAt(),
                incident.getResolvedAt(),
                incident.getCreatedAt(),
                incident.getUpdatedAt());
    }
}
