
package opspilot_backend.ai.controller;

import opspilot_backend.ai.service.IncidentAiService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidentAiController {

    private final IncidentAiService incidentAiService;

    public IncidentAiController(IncidentAiService incidentAiService) {
        this.incidentAiService = incidentAiService;
    }

    @PostMapping("/diagnose")
    public ResponseEntity<String> diagnoseIncident(
            @RequestBody IncidentDiagnosisRequest request) {

        String diagnosis = incidentAiService.diagnoseIncident(
                request.title(),
                request.description(),
                request.severity(),
                request.serviceName());

        return ResponseEntity.ok(diagnosis);
    }

    public record IncidentDiagnosisRequest(
            String title,
            String description,
            String severity,
            String serviceName) {
    }
}
