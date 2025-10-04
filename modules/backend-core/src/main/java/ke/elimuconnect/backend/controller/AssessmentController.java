package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.Assessment;
import ke.elimuconnect.backend.entity.AssessmentSubmission;
import ke.elimuconnect.backend.service.AssessmentService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
public class AssessmentController {
    
    private final AssessmentService assessmentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Assessment>> createAssessment(
            @RequestBody Assessment assessment) {
        Assessment created = assessmentService.createAssessment(assessment);
        return ResponseEntity.ok(ApiResponse.success(created));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Assessment>>> getAssessments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Assessment> assessments = assessmentService.getPublishedAssessments(
            PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(assessments));
    }
    
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<Assessment>>> filterAssessments(
            @RequestParam String subject,
            @RequestParam String grade,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Assessment> assessments = assessmentService.filterAssessments(
            subject, grade, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(assessments));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Assessment>> getAssessment(@PathVariable String id) {
        Assessment assessment = assessmentService.getAssessment(id);
        return ResponseEntity.ok(ApiResponse.success(assessment));
    }
    
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<AssessmentSubmission>> submitAssessment(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> answers) {
        
        String studentId = userDetails.getUsername();
        String studentName = userDetails.getUsername(); // You might want to fetch actual name
        
        AssessmentSubmission submission = assessmentService.submitAssessment(
            id, studentId, studentName, answers);
        return ResponseEntity.ok(ApiResponse.success(submission));
    }
    
    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<List<AssessmentSubmission>>> getMySubmissions(
            @AuthenticationPrincipal UserDetails userDetails) {
        String studentId = userDetails.getUsername();
        List<AssessmentSubmission> submissions = assessmentService.getStudentSubmissions(studentId);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }
    
    @GetMapping("/my-progress")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        String studentId = userDetails.getUsername();
        Map<String, Object> progress = assessmentService.getStudentProgress(studentId);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }
}
