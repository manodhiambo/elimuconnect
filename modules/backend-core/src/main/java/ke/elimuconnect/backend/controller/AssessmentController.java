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

import java.util.*;

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
        String studentName = userDetails.getUsername();
        
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

    @PostMapping("/seed-sample")
    public ResponseEntity<ApiResponse<String>> seedSampleAssessment() {
        Assessment sample = new Assessment();
        sample.setTitle("Mathematics Quiz - Algebra Basics");
        sample.setDescription("Test your understanding of basic algebra concepts");
        sample.setSubject("Mathematics");
        sample.setGrade("Form 1");
        sample.setTeacherId("admin");
        sample.setTeacherName("System Admin");
        sample.setDuration(30);
        sample.setTotalMarks(20);
        sample.setPassingMarks(12);
        sample.setPublished(true);
        sample.setCreatedAt(java.time.LocalDateTime.now());
        
        List<Assessment.Question> questions = new ArrayList<>();
        
        Assessment.Question q1 = new Assessment.Question();
        q1.setId(java.util.UUID.randomUUID().toString());
        q1.setText("What is the value of x in the equation: 2x + 5 = 15?");
        q1.setType("MCQ");
        q1.setOptions(Arrays.asList("3", "5", "7", "10"));
        q1.setCorrectAnswer("5");
        q1.setMarks(5);
        questions.add(q1);
        
        Assessment.Question q2 = new Assessment.Question();
        q2.setId(java.util.UUID.randomUUID().toString());
        q2.setText("Is the statement true or false: x + x = 2x");
        q2.setType("TRUE_FALSE");
        q2.setOptions(Arrays.asList("True", "False"));
        q2.setCorrectAnswer("True");
        q2.setMarks(5);
        questions.add(q2);
        
        Assessment.Question q3 = new Assessment.Question();
        q3.setId(java.util.UUID.randomUUID().toString());
        q3.setText("Solve for y: 3y - 6 = 12");
        q3.setType("MCQ");
        q3.setOptions(Arrays.asList("2", "4", "6", "8"));
        q3.setCorrectAnswer("6");
        q3.setMarks(5);
        questions.add(q3);
        
        Assessment.Question q4 = new Assessment.Question();
        q4.setId(java.util.UUID.randomUUID().toString());
        q4.setText("What is 5a + 3a?");
        q4.setType("MCQ");
        q4.setOptions(Arrays.asList("8a", "15a", "8", "15"));
        q4.setCorrectAnswer("8a");
        q4.setMarks(5);
        questions.add(q4);
        
        sample.setQuestions(questions);
        assessmentService.createAssessment(sample);
        
        return ResponseEntity.ok(ApiResponse.success("Sample assessment created successfully"));
    }
}
