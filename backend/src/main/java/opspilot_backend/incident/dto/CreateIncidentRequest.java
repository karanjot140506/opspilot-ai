package opspilot_backend.incident.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateIncidentRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be at most 200 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotBlank(message = "Severity is required")
        String severity,

        @NotBlank(message = "Service name is required")
        @Size(max = 100, message = "Service name must be at most 100 characters")
        String serviceName

) {
}

