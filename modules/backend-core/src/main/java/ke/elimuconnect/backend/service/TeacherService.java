package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.repository.UserRepository;
import ke.elimuconnect.backend.repository.ContentRepository;
import ke.elimuconnect.backend.exception.ResourceNotFoundException;
import ke.elimuconnect.domain.Content;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherService {

    private final UserRepository userRepository;
    private final ContentRepository contentRepository;

    public Map<String, Object> getTeacherDashboard(String teacherId) {
        User teacher = userRepository.findById(teacherId)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        Map<String, Object> dashboard = new HashMap<>();
        
        // Get teacher's uploaded content
        List<Content> teacherContent = contentRepository.findByUploadedBy(teacherId);
        
        // Calculate stats
        long totalContent = teacherContent.size();
        long publishedContent = teacherContent.stream().filter(Content::isPublished).count();
        long pendingContent = totalContent - publishedContent;
        
        dashboard.put("totalContent", totalContent);
        dashboard.put("publishedContent", publishedContent);
        dashboard.put("pendingContent", pendingContent);
        dashboard.put("teacherName", teacher.getFullName());
        dashboard.put("teacherEmail", teacher.getEmail());
        
        return dashboard;
    }

    public Page<Content> getMyContent(String teacherId, Pageable pageable) {
        return contentRepository.findByUploadedBy(teacherId, pageable);
    }

    public Page<Content> getMyPublishedContent(String teacherId, Pageable pageable) {
        return contentRepository.findByUploadedByAndPublishedTrue(teacherId, pageable);
    }

    public Page<Content> getMyPendingContent(String teacherId, Pageable pageable) {
        return contentRepository.findByUploadedByAndPublishedFalse(teacherId, pageable);
    }
}
