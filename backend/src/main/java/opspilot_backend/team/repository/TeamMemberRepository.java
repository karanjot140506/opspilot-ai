
package opspilot_backend.team.repository;

import opspilot_backend.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamMemberRepository
        extends JpaRepository<TeamMember, Long> {

    Optional<TeamMember> findByEmail(String email);

    boolean existsByEmail(String email);
}
