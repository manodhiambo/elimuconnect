package ke.elimuconnect.backend.controller;

import ke.elimuconnect.domain.Content;
import ke.elimuconnect.backend.repository.ContentRepository;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/content")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
public class ContentController {
    
    private final ContentRepository contentRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Content>>> getAllContent(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        Page<Content> content = contentRepository.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Content>> getContent(@PathVariable String id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Content>> uploadContent(
            @RequestParam(name = "title") String title,
            @RequestParam(name = "description") String description,
            @RequestParam(name = "subject") String subject,
            @RequestParam(name = "grade") String grade,
            @RequestParam(name = "contentType") String contentType,
            @RequestParam(name = "file", required = false) MultipartFile file) {
        
        Content content = Content.builder()
                .title(title)
                .description(description)
                .subject(subject)
                .grade(grade)
                .contentType(contentType)
                .published(false)
                .viewCount(0)
                .downloadCount(0)
                .createdAt(LocalDateTime.now().toString())
                .updatedAt(LocalDateTime.now().toString())
                .build();
        
        Content saved = contentRepository.save(content);
        return ResponseEntity.ok(ApiResponse.success(saved, "Content uploaded successfully"));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Content>> updateContent(
            @PathVariable String id,
            @RequestBody Content contentUpdate) {
        
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        content.setTitle(contentUpdate.getTitle());
        content.setDescription(contentUpdate.getDescription());
        content.setSubject(contentUpdate.getSubject());
        content.setGrade(contentUpdate.getGrade());
        content.setUpdatedAt(LocalDateTime.now().toString());
        
        Content updated = contentRepository.save(content);
        return ResponseEntity.ok(ApiResponse.success(updated, "Content updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable String id) {
        contentRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Content deleted successfully"));
    }
    
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Content>> publishContent(@PathVariable String id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        content.setPublished(true);
        content.setUpdatedAt(LocalDateTime.now().toString());
        
        Content updated = contentRepository.save(content);
        return ResponseEntity.ok(ApiResponse.success(updated, "Content published successfully"));
    }
}
