package ke.elimuconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalUsers;
    private long pendingApprovals;
    private long totalSchools;
    private long totalContent;
    private long activeUsers;
    private long newRegistrationsToday;
}
