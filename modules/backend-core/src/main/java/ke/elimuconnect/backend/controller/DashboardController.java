package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.repository.*;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
        long activeUsers = userRepository.countByActive(true);
        long inactiveUsers = userRepository.countByActive(false);
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalSchools", totalSchools);
        stats.put("pendingApprovals", inactiveUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("totalContent", 0);
        stats.put("newRegistrationsToday", 0);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Map<String, String>> activities = new ArrayList<>();
        
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
