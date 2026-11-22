
package opspilot_backend.ai.service;

import opspilot_backend.team.entity.TeamMember;
import opspilot_backend.team.repository.TeamMemberRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncidentAssignmentService {

    private final ChatClient chatClient;
    private final TeamMemberRepository teamMemberRepository;

    public IncidentAssignmentService(
            ChatClient.Builder chatClientBuilder,
            TeamMemberRepository teamMemberRepository) {

        this.chatClient = chatClientBuilder.build();
        this.teamMemberRepository = teamMemberRepository;
    }

    public String recommendAssignee(
            String title,
            String description,
            String severity,
            String serviceName) {

        List<TeamMember> teamMembers =
                teamMemberRepository.findAll();

        String teamDetails = teamMembers.stream()
                .map(member ->
                        "ID: " + member.getId()
                        + ", Name: " + member.getName()
                        + ", Role: " + member.getRole()
                        + ", Skills: " + member.getSkills())
                .reduce("", (a, b) -> a + "\n" + b);

        return chatClient.prompt()
                .system("""
                        You are an expert IT incident management assistant.

                        Recommend the most suitable team member for an incident
                        based on their technical skills and role.

                        Consider the incident's title, description,
                        severity, and affected service.

                        Return:
                        1. Recommended team member ID
                        2. Recommended team member name
                        3. Reason for the recommendation

                        Only recommend a member from the provided team list.
                        Do not invent team members or IDs.
                        """)
                .user("""
                        Incident:
                        Title: %s
                        Description: %s
                        Severity: %s
                        Affected Service: %s

                        Available Team Members:
                        %s
                        """.formatted(
                        title,
                        description,
                        severity,
                        serviceName,
                        teamDetails))
                .call()
                .content();
    }
}
