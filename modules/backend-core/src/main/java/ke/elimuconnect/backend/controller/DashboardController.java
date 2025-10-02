package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.repository.UserRepository;
import ke.elimuconnect.backend.repository.SchoolRepository;
import ke.elimuconnect.backend.repository.ContentRepository;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {
    
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ContentRepository contentRepository;
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Count users
        long totalUsers = userRepository.count();
        long pendingUsers = userRepository.countByActive(false);
        long activeUsers = userRepository.countByActive(true);
        
        // Count schools
        long totalSchools = schoolRepository.count();
        
        // Count content
        long totalContent = contentRepository.count();
        
        stats.put("totalUsers", totalUsers);
        stats.put("pendingApprovals", pendingUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("totalSchools", totalSchools);
        stats.put("totalContent", totalContent);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
