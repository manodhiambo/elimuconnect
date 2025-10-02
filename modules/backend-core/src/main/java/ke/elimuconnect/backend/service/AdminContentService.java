package ke.elimuconnect.backend.service;

import ke.elimuconnect.domain.Content;
import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.exception.ResourceNotFoundException;
import ke.elimuconnect.backend.repository.ContentRepository;
import ke.elimuconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminContentService {
    
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final EmailNotificationService emailNotificationService;
    
    public Page<Content> getAllContent(Pageable pageable) {
        return contentRepository.findAll(pageable);
    }
    
    public Page<Content> getPendingContent(Pageable pageable) {
        return contentRepository.findByPublished(false, pageable);
    }
    
    public Content getContentById(String id) {
        return contentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
    }
    
    @Transactional
    public Content uploadContent(
            MultipartFile file,
            String title,
            String description,
            String contentType,
            String subject,
            String grade,
            String language,
            String difficultyLevel,
            String author,
            String publisher,
            String tags,
            int estimatedDurationMinutes) {
        
        // Upload file to storage
        String fileUrl = fileStorageService.uploadFile(file, "content");
        
        // Parse tags
        String[] tagArray = tags != null ? tags.split(",") : new String[0];
        
        Content content = Content.builder()
            .title(title)
            .description(description)
            .contentType(contentType)
            .fileUrl(fileUrl)
            .fileSizeBytes(file.getSize())
            .mimeType(file.getContentType())
            .subject(subject)
            .grade(grade)
            .language(language)
            .difficultyLevel(difficultyLevel)
            .author(author)
            .publisher(publisher)
            .tags(Arrays.asList(tagArray))
            .estimatedDurationMinutes(estimatedDurationMinutes)
            .published(false)
            .featured(false)
            .viewCount(0)
            .downloadCount(0)
            .averageRating(0.0)
            .ratingCount(0)
            .offlineAvailable(false)
            .createdAt(LocalDateTime.now().toString())
            .createdBy("admin") // Get from security context
            .build();
        
        Content savedContent = contentRepository.save(content);
        
        // Send notification to admin
        User admin = userRepository.findByEmail("manodhiambo@gmail.com").orElse(null);
        if (admin != null) {
            emailNotificationService.sendContentUploadNotification(savedContent, admin);
        }
        
        log.info("Content uploaded: {}", title);
        return savedContent;
    }
    
    @Transactional
    public Content approveContent(String id) {
        Content content = getContentById(id);
        content.setPublished(true);
        content.setPublishedAt(LocalDateTime.now().toString());
        Content savedContent = contentRepository.save(content);
        
        // Send approval email to uploader
        User uploader = userRepository.findById(content.getCreatedBy()).orElse(null);
        if (uploader != null) {
            emailNotificationService.sendContentApprovalEmail(savedContent, uploader.getEmail());
        }
        
        log.info("Content approved: {}", content.getTitle());
        return savedContent;
    }
    
    @Transactional
    public void rejectContent(String id, String reason) {
        Content content = getContentById(id);
        
        // Send rejection email
        User uploader = userRepository.findById(content.getCreatedBy()).orElse(null);
        if (uploader != null) {
            emailNotificationService.sendContentRejectionEmail(content, uploader.getEmail(), reason);
        }
        
        // Delete the content
        contentRepository.delete(content);
        
        log.info("Content rejected and deleted: {}", content.getTitle());
    }
    
    @Transactional
    public Content publishContent(String id) {
        Content content = getContentById(id);
        content.setPublished(true);
        content.setPublishedAt(LocalDateTime.now().toString());
        return contentRepository.save(content);
    }
    
    @Transactional
    public Content unpublishContent(String id) {
        Content content = getContentById(id);
        content.setPublished(false);
        return contentRepository.save(content);
    }
    
    @Transactional
    public Content updateContent(String id, Content updatedContent) {
        Content content = getContentById(id);
        
        if (updatedContent.getTitle() != null) content.setTitle(updatedContent.getTitle());
        if (updatedContent.getDescription() != null) content.setDescription(updatedContent.getDescription());
        if (updatedContent.getSubject() != null) content.setSubject(updatedContent.getSubject());
        if (updatedContent.getGrade() != null) content.setGrade(updatedContent.getGrade());
        if (updatedContent.getTags() != null) content.setTags(updatedContent.getTags());
        
        content.setUpdatedAt(LocalDateTime.now().toString());
        
        return contentRepository.save(content);
    }
    
    @Transactional
    public void deleteContent(String id) {
        Content content = getContentById(id);
        contentRepository.delete(content);
        log.info("Content deleted: {}", content.getTitle());
    }
}
