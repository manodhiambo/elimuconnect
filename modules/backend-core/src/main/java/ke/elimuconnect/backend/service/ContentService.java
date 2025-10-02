package ke.elimuconnect.backend.service;

import ke.elimuconnect.domain.Content;
import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.exception.ResourceNotFoundException;
import ke.elimuconnect.backend.repository.ContentRepository;
import ke.elimuconnect.backend.repository.UserRepository;
import ke.elimuconnect.domain.content.ContentUploadRequest;
import ke.elimuconnect.domain.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentService {
    
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Content uploadContent(ContentUploadRequest request, String userId) {
        log.info("User {} uploading content: {}", userId, request.getTitle());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Validate user can upload content
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.TEACHER) {
            throw new IllegalArgumentException("Only admins and teachers can upload content");
        }
        
        Content content = Content.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .contentType(request.getContentType())
                .fileUrl(request.getFileUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .fileSizeBytes(request.getFileSizeBytes())
                .mimeType(request.getMimeType())
                .subject(request.getSubject())
                .grade(request.getGrade())
                .learningAreas(request.getLearningAreas())
                .strands(request.getStrands())
                .subStrands(request.getSubStrands())
                .learningOutcomes(request.getLearningOutcomes())
                .author(request.getAuthor())
                .uploadedBy(userId)
                .language(request.getLanguage())
                .tags(request.getTags())
                .difficultyLevel(request.getDifficultyLevel())
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes())
                .accessLevel(request.getAccessLevel())
                .allowedSchoolIds(request.getAllowedSchoolIds())
                .allowedGrades(request.getAllowedGrades())
                .published(false) // Requires approval
                .approved(user.getRole() == UserRole.ADMIN) // Auto-approve for admins
                .isPublisherContent(false)
                .build();
        
        if (user.getRole() == UserRole.ADMIN) {
            content.setApprovedBy(userId);
            content.setApprovedAt(LocalDateTime.now().toString());
            content.setPublished(true);
            content.setPublishedAt(LocalDateTime.now().toString());
        }
        
        Content savedContent = contentRepository.save(content);
        log.info("Content uploaded successfully with ID: {}", savedContent.getId());
        
        return savedContent;
    }
    
    @Transactional
    public Content approveContent(String contentId, String adminId) {
        log.info("Admin {} approving content: {}", adminId, contentId);
        
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content", "id", contentId));
        
        content.setApproved(true);
        content.setApprovedBy(adminId);
        content.setApprovedAt(LocalDateTime.now().toString());
        content.setPublished(true);
        content.setPublishedAt(LocalDateTime.now().toString());
        
        return contentRepository.save(content);
    }
    
    public Page<Content> getPublishedContent(Pageable pageable) {
        return contentRepository.findByPublishedTrue(pageable);
    }
    
    public Page<Content> getContentBySubjectAndGrade(String subject, String grade, Pageable pageable) {
        return contentRepository.findBySubjectAndGradeAndPublishedTrue(subject, grade, pageable);
    }
    
    public Page<Content> getPendingApprovalContent(Pageable pageable) {
        return contentRepository.findByApprovedFalse(pageable);
    }
    
    public List<Content> getMyContent(String userId) {
        return contentRepository.findByUploadedByAndPublishedTrue(userId);
    }
    
    @Transactional
    public void deleteContent(String contentId, String userId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content", "id", contentId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Only allow deletion by uploader or admin
        if (!content.getUploadedBy().equals(userId) && user.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("You don't have permission to delete this content");
        }
        
        contentRepository.delete(content);
        log.info("Content deleted: {}", contentId);
    }
    
    public Page<Content> searchContent(String searchText, Pageable pageable) {
        return contentRepository.searchByText(searchText, pageable);
    }
}
