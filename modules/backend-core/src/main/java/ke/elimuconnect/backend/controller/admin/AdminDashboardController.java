package ke.elimuconnect.backend.controller.admin;

import ke.elimuconnect.backend.dto.DashboardStatsDTO;
import ke.elimuconnect.backend.service.AdminDashboardService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    
    private final AdminDashboardService dashboardService;
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats() {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> activity = dashboardService.getRecentActivity(limit);
        return ResponseEntity.ok(ApiResponse.success(activity));
    }
}
