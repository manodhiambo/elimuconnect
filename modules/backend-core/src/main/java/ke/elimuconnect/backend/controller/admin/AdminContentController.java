package ke.elimuconnect.backend.controller.admin;

import ke.elimuconnect.domain.Content;
import ke.elimuconnect.backend.service.AdminContentService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {
    
    private final AdminContentService adminContentService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Content>>> getAllContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<Content> content = adminContentService.getAllContent(
            PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Page<Content>>> getPendingContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<Content> content = adminContentService.getPendingContent(
            PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Content>> getContentById(@PathVariable String id) {
        Content content = adminContentService.getContentById(id);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Content>> uploadContent(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("contentType") String contentType,
            @RequestParam("subject") String subject,
            @RequestParam("grade") String grade,
            @RequestParam("language") String language,
            @RequestParam("difficultyLevel") String difficultyLevel,
            @RequestParam("author") String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam("estimatedDurationMinutes") int estimatedDurationMinutes) {
        
        Content content = adminContentService.uploadContent(
            file, title, description, contentType, subject, grade,
            language, difficultyLevel, author, publisher, tags,
            estimatedDurationMinutes);
        
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Content>> approveContent(@PathVariable String id) {
        Content content = adminContentService.approveContent(id);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectContent(
            @PathVariable String id,
            @RequestBody RejectRequest request) {
        adminContentService.rejectContent(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<Content>> publishContent(@PathVariable String id) {
        Content content = adminContentService.publishContent(id);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<Content>> unpublishContent(@PathVariable String id) {
        Content content = adminContentService.unpublishContent(id);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Content>> updateContent(
            @PathVariable String id,
            @RequestBody Content content) {
        Content updated = adminContentService.updateContent(id, content);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable String id) {
        adminContentService.deleteContent(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    public static class RejectRequest {
        private String reason;
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
