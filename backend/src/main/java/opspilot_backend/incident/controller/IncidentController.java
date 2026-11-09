
package opspilot_backend.incident.controller;

import jakarta.validation.Valid;
import opspilot_backend.incident.dto.CreateIncidentRequest;
import opspilot_backend.incident.dto.IncidentResponse;
import opspilot_backend.incident.entity.Incident;
import opspilot_backend.incident.service.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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

        String priority = request.priority().trim().toUpperCase();

        if (!List.of("CRITICAL", "HIGH", "MEDIUM", "LOW")
                .contains(priority)) {
            throw new IllegalArgumentException(
                    "Invalid priority. Allowed values: CRITICAL, HIGH, MEDIUM, LOW");
        }

        Incident incident = new Incident();
        incident.setTitle(request.title().trim());
        incident.setDescription(request.description().trim());
        incident.setSeverity(request.severity().trim().toUpperCase());
        incident.setServiceName(request.serviceName().trim());
        incident.setPriority(priority);

        Incident saved = incidentService.createIncident(incident);

        return IncidentResponse.from(
                saved,
                incidentService.getSlaStatus(saved));
    }

    @GetMapping
    public List<IncidentResponse> getAllIncidents() {
        return incidentService.getAllIncidents()
                .stream()
                .map(incident -> IncidentResponse.from(
                        incident,
                        incidentService.getSlaStatus(incident)))
                .toList();
    }

    @GetMapping("/{id}")
    public IncidentResponse getIncidentById(@PathVariable("id") Long id) {
        Incident incident = incidentService.getIncidentById(id);

        return IncidentResponse.from(
                incident,
                incidentService.getSlaStatus(incident));
    }

    @PatchMapping("/{id}/status")
    public IncidentResponse updateIncidentStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request) {

        Incident updated = incidentService.updateIncidentStatus(
                id,
                request.get("status"));

        return IncidentResponse.from(
                updated,
                incidentService.getSlaStatus(updated));
    }

    @PatchMapping("/{id}/assign")
    public IncidentResponse assignIncident(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Long> request) {

        Incident updated = incidentService.assignIncident(
                id,
                request.get("teamMemberId"));

        return IncidentResponse.from(
                updated,
                incidentService.getSlaStatus(updated));
    }

    @PatchMapping("/{id}/priority")
    public IncidentResponse updateIncidentPriority(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request) {

        Incident updated = incidentService.updateIncidentPriority(
                id,
                request.get("priority"));

        return IncidentResponse.from(
                updated,
                incidentService.getSlaStatus(updated));
    }
}
