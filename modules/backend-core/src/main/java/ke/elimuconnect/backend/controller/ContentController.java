package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.Content;
import ke.elimuconnect.backend.service.ContentService;
import ke.elimuconnect.backend.service.FileStorageService;
import ke.elimuconnect.domain.common.ApiResponse;
import ke.elimuconnect.domain.content.ContentUploadRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContentController {
    
    private final ContentService contentService;
    private final FileStorageService fileStorageService;
    
    @PostMapping("/upload/file")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category) {
        String fileUrl = fileStorageService.storeFile(file, category);
        return ResponseEntity.ok(ApiResponse.success(fileUrl, "File uploaded successfully"));
    }
    
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Content>> uploadContent(
            @Valid @RequestBody ContentUploadRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        Content content = contentService.uploadContent(request, userId);
        return ResponseEntity.ok(ApiResponse.success(content, 
                "Content uploaded successfully. Pending approval."));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Content>>> getAllContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<Content> content = contentService.getPublishedContent(pageable);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<Content>>> getContentBySubjectAndGrade(
            @RequestParam String subject,
            @RequestParam String grade,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Content> content = contentService.getContentBySubjectAndGrade(subject, grade, pageable);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Content>>> searchContent(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Content> content = contentService.searchContent(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @GetMapping("/my-content")
    public ResponseEntity<ApiResponse<List<Content>>> getMyContent(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        List<Content> content = contentService.getMyContent(userId);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Content>> approveContent(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminId = userDetails.getUsername();
        Content content = contentService.approveContent(id, adminId);
        return ResponseEntity.ok(ApiResponse.success(content, "Content approved successfully"));
    }
    
    @GetMapping("/pending-approval")
    public ResponseEntity<ApiResponse<Page<Content>>> getPendingApprovalContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Content> content = contentService.getPendingApprovalContent(pageable);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContent(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        contentService.deleteContent(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Content deleted successfully"));
    }
}
