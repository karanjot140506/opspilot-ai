package opspilot_backend.team.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTeamMemberRequest(

    @NotBlank
    @Size(max = 100)
    String name,

    @NotBlank
    @Email
    @Size(max = 150)
    String email,

    @NotBlank
    @Size(max = 50)
    String role

) {}