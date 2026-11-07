package opspilot_backend.team.dto;

import opspilot_backend.team.entity.TeamMember;
import java.time.OffsetDateTime;

public record TeamMemberResponse(
    Long id,
    String name,
    String email,
    String role,
    OffsetDateTime createdAt
) {

    public static TeamMemberResponse from(TeamMember member) {
        return new TeamMemberResponse(
            member.getId(),
            member.getName(),
            member.getEmail(),
            member.getRole(),
            member.getCreatedAt()
        );
    }
}