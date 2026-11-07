
package opspilot_backend.team.controller;

import jakarta.validation.Valid;

import opspilot_backend.team.dto.CreateTeamMemberRequest;
import opspilot_backend.team.dto.TeamMemberResponse;
import opspilot_backend.team.entity.TeamMember;
import opspilot_backend.team.service.TeamMemberService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
@CrossOrigin(origins = "http://localhost:5173")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    public TeamMemberController(TeamMemberService teamMemberService) {
        this.teamMemberService = teamMemberService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMemberResponse createTeamMember(
            @Valid @RequestBody CreateTeamMemberRequest request) {

        TeamMember member = teamMemberService.createTeamMember(request);

        return TeamMemberResponse.from(member);
    }

    @GetMapping
    public List<TeamMemberResponse> getAllTeamMembers() {

        return teamMemberService.getAllTeamMembers()
                .stream()
                .map(TeamMemberResponse::from)
                .toList();
    }
}
