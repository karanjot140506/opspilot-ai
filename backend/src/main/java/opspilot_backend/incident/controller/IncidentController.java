package opspilot_backend.incident.controller;

import jakarta.validation.Valid;
import opspilot_backend.incident.dto.CreateIncidentRequest;
import opspilot_backend.incident.dto.IncidentResponse;
import opspilot_backend.incident.entity.Incident;
import opspilot_backend.incident.service.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse createIncident(
            @Valid @RequestBody CreateIncidentRequest request) {

        Incident incident = new Incident();
        incident.setTitle(request.title().trim());
        incident.setDescription(request.description().trim());
        incident.setSeverity(request.severity().trim().toUpperCase());
        incident.setServiceName(request.serviceName().trim());
        incident.setPriority(request.priority().trim().toUpperCase());

        Incident saved = incidentService.createIncident(incident);
        if (!List.of("CRITICAL", "HIGH", "MEDIUM", "LOW")
                .contains(incident.getPriority())) {
            throw new IllegalArgumentException(
                    "Invalid priority. Allowed values: CRITICAL, HIGH, MEDIUM, LOW");
        }
        return IncidentResponse.from(saved);
    }

    @GetMapping
    public List<IncidentResponse> getAllIncidents() {
        return incidentService.getAllIncidents()
                .stream()
                .map(IncidentResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public IncidentResponse getIncidentById(@PathVariable("id") Long id) {
        return IncidentResponse.from(
                incidentService.getIncidentById(id));
    }

    @PatchMapping("/{id}/status")
    public IncidentResponse updateIncidentStatus(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, String> request) {

        Incident updated = incidentService.updateIncidentStatus(
                id,
                request.get("status"));

        return IncidentResponse.from(updated);
    }

}
