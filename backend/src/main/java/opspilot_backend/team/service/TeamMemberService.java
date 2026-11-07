
package opspilot_backend.team.service;

import opspilot_backend.team.dto.CreateTeamMemberRequest;
import opspilot_backend.team.entity.TeamMember;
import opspilot_backend.team.repository.TeamMemberRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;

    public TeamMemberService(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
    }

    @Transactional
    public TeamMember createTeamMember(CreateTeamMemberRequest request) {

        String email = request.email().trim().toLowerCase();

        if (teamMemberRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                "A team member with this email already exists."
            );
        }

        TeamMember member = new TeamMember();

        member.setName(request.name().trim());
        member.setEmail(email);
        member.setRole(request.role().trim().toUpperCase());
        member.setCreatedAt(OffsetDateTime.now());

        return teamMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public List<TeamMember> getAllTeamMembers() {
        return teamMemberRepository.findAll();
    }
}
