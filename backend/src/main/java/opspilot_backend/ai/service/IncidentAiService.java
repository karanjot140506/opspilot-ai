
package opspilot_backend.ai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class IncidentAiService {

    private final ChatClient chatClient;

    public IncidentAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String diagnoseIncident(
            String title,
            String description,
            String severity,
            String serviceName) {

        return chatClient.prompt()
                .system("""
                        You are an experienced Site Reliability Engineer
                        and IT incident management expert.

                        Analyze incidents and provide:
                        1. Possible root causes
                        2. Recommended investigation steps
                        3. Step-by-step resolution suggestions
                        4. Preventive measures

                        Be clear, practical, and technically accurate.
                        Never claim certainty when the available information
                        is insufficient.
                        """)
                .user("""
                        Analyze this IT incident:

                        Title: %s
                        Description: %s
                        Severity: %s
                        Affected Service: %s
                        """.formatted(
                        title,
                        description,
                        severity,
                        serviceName))
                .call()
                .content();
    }
}
