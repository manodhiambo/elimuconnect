package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.repository.ContentRepository;
import ke.elimuconnect.domain.Content;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
public class PublicContentController {

    private final ContentRepository contentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Content>>> getAllContent(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        Page<Content> content = contentRepository.findByPublishedTrue(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Content>>> searchContent(
            @RequestParam(name = "query") String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        Page<Content> content = contentRepository.findByTitleContainingIgnoreCaseAndPublishedTrue(
            query, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<Content>>> filterContent(
            @RequestParam(name = "subject") String subject,
            @RequestParam(name = "grade") String grade,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        Page<Content> content = contentRepository.findBySubjectAndGradeAndPublishedTrue(
            subject, grade, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Content>> getContent(@PathVariable String id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        // Increment view count
        content.setViewCount(content.getViewCount() + 1);
        contentRepository.save(content);
        
        return ResponseEntity.ok(ApiResponse.success(content));
    }
}
