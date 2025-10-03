package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.service.StudentService;
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
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Fetching student dashboard for: {}", userDetails.getUsername());
        Map<String, Object> dashboard = studentService.getStudentDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/content")
    public ResponseEntity<ApiResponse<Page<Content>>> getAvailableContent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<Content> content = studentService.getAvailableContent(
            userDetails.getUsername(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }

    @GetMapping("/content/search")
    public ResponseEntity<ApiResponse<Page<Content>>> searchContent(
            @RequestParam(name = "q") String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<Content> content = studentService.searchContent(
            query, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(content));
    }
}
