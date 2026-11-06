
package opspilot_backend.incident.activity.controller;

import opspilot_backend.incident.activity.dto.IncidentActivityResponse;
import opspilot_backend.incident.activity.service.IncidentActivityService;
import opspilot_backend.incident.service.IncidentNotFoundException;
import opspilot_backend.incident.service.IncidentService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents/{incidentId}/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidentActivityController {

    private final IncidentActivityService activityService;
    private final IncidentService incidentService;

    public IncidentActivityController(
            IncidentActivityService activityService,
            IncidentService incidentService) {
        this.activityService = activityService;
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<IncidentActivityResponse> getActivities(
            @PathVariable("incidentId") Long incidentId) {

        // Confirm that the incident exists before returning its activities.
        incidentService.getIncidentById(incidentId);

        return activityService.getActivities(incidentId)
                .stream()
                .map(IncidentActivityResponse::from)
                .toList();
    }
}
