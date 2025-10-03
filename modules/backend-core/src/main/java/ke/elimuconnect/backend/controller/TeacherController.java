package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.service.TeacherService;
import ke.elimuconnect.domain.Content;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Fetching teacher dashboard for: {}", userDetails.getUsername());
        Map<String, Object> dashboard = teacherService.getTeacherDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/content")
    public ResponseEntity<ApiResponse<Page<Content>>> getMyContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<Content> content = teacherService.getMyContent(
            userDetails.getUsername(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }

    @GetMapping("/content/published")
    public ResponseEntity<ApiResponse<Page<Content>>> getMyPublishedContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<Content> content = teacherService.getMyPublishedContent(
            userDetails.getUsername(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }

    @GetMapping("/content/pending")
    public ResponseEntity<ApiResponse<Page<Content>>> getMyPendingContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<Content> content = teacherService.getMyPendingContent(
            userDetails.getUsername(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }
}
