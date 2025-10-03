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

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;
    private final ContentRepository contentRepository;

    public Map<String, Object> getStudentDashboard(String studentId) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Map<String, Object> dashboard = new HashMap<>();
        
        // Get available content for student's grade
        Page<Content> availableContent = contentRepository.findByPublishedTrue(
            Pageable.ofSize(10));
        
        dashboard.put("studentName", student.getName());
        dashboard.put("className", student.getClassName());
        dashboard.put("admissionNumber", student.getAdmissionNumber());
        dashboard.put("availableContent", availableContent.getTotalElements());
        dashboard.put("recentContent", availableContent.getContent());
        
        return dashboard;
    }

    public Page<Content> getAvailableContent(String studentId, Pageable pageable) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        // Return all published content (can be filtered by grade later)
        return contentRepository.findByPublishedTrue(pageable);
    }

    public Page<Content> searchContent(String searchText, Pageable pageable) {
        return contentRepository.searchByText(searchText, pageable);
    }
}
