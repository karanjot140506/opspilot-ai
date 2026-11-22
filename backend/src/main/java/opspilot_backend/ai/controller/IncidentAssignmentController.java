
package opspilot_backend.ai.controller;

import opspilot_backend.ai.service.IncidentAssignmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidentAssignmentController {

    private final IncidentAssignmentService assignmentService;

    public IncidentAssignmentController(
            IncidentAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/recommend-assignee")
    public ResponseEntity<String> recommendAssignee(
            @RequestBody AssignmentRequest request) {

        String recommendation = assignmentService.recommendAssignee(
                request.title(),
                request.description(),
                request.severity(),
                request.serviceName()
        );

        return ResponseEntity.ok(recommendation);
    }

    public record AssignmentRequest(
            String title,
            String description,
            String severity,
            String serviceName
    ) {}
}
