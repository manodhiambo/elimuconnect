package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.repository.*;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalSchools = schoolRepository.count();
        long pendingApprovals = userRepository.countByApprovalStatus("PENDING");
        long activeUsers = userRepository.countByActive(true);
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalSchools", totalSchools);
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("activeUsers", activeUsers);
        stats.put("totalContent", 0); // TODO: Add when content module is implemented
        stats.put("newRegistrationsToday", 0); // TODO: Add when we track registration dates
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Map<String, String>> activities = new ArrayList<>();
        
        // TODO: Implement actual activity tracking
        // For now, return empty list
        
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
