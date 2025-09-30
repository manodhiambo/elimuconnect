package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.dto.DashboardStatsDTO;
import ke.elimuconnect.backend.repository.ContentRepository;
import ke.elimuconnect.backend.repository.SchoolRepository;
import ke.elimuconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ContentRepository contentRepository;
    
    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long pendingApprovals = userRepository.countByActive(false);
        long totalSchools = schoolRepository.count();
        long totalContent = contentRepository.count();
        long activeUsers = userRepository.countByActive(true);
        
        // Calculate new registrations today
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long newRegistrationsToday = userRepository.countByCreatedAtAfter(startOfDay);
        
        return DashboardStatsDTO.builder()
            .totalUsers(totalUsers)
            .pendingApprovals(pendingApprovals)
            .totalSchools(totalSchools)
            .totalContent(totalContent)
            .activeUsers(activeUsers)
            .newRegistrationsToday(newRegistrationsToday)
            .build();
    }
    
    public List<Map<String, Object>> getRecentActivity(int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // This is a simplified version - in production, you'd want an Activity entity
        // For now, we'll return mock data
        // TODO: Implement proper activity logging
        
        return activities;
    }
}
