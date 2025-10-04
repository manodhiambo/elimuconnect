package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.Assessment;
import ke.elimuconnect.backend.entity.AssessmentSubmission;
import ke.elimuconnect.backend.repository.AssessmentRepository;
import ke.elimuconnect.backend.repository.AssessmentSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AssessmentService {
    
    private final AssessmentRepository assessmentRepository;
    private final AssessmentSubmissionRepository submissionRepository;
    
    public Assessment createAssessment(Assessment assessment) {
        assessment.setCreatedAt(LocalDateTime.now());
        assessment.getQuestions().forEach(q -> q.setId(UUID.randomUUID().toString()));
        return assessmentRepository.save(assessment);
    }
    
    public Page<Assessment> getPublishedAssessments(Pageable pageable) {
        return assessmentRepository.findByPublishedTrue(pageable);
    }
    
    public Page<Assessment> filterAssessments(String subject, String grade, Pageable pageable) {
        return assessmentRepository.findBySubjectAndGradeAndPublishedTrue(subject, grade, pageable);
    }
    
    public Assessment getAssessment(String id) {
        return assessmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Assessment not found"));
    }
    
    public AssessmentSubmission submitAssessment(String assessmentId, String studentId, 
                                                 String studentName, Map<String, String> answers) {
        Assessment assessment = getAssessment(assessmentId);
        
        // Check if already submitted
        Optional<AssessmentSubmission> existing = submissionRepository
            .findByAssessmentIdAndStudentId(assessmentId, studentId);
        if (existing.isPresent()) {
            throw new RuntimeException("Assessment already submitted");
        }
        
        // Calculate score
        int score = 0;
        for (Assessment.Question question : assessment.getQuestions()) {
            String studentAnswer = answers.get(question.getId());
            if (studentAnswer != null && studentAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim())) {
                score += question.getMarks();
            }
        }
        
        AssessmentSubmission submission = new AssessmentSubmission();
        submission.setAssessmentId(assessmentId);
        submission.setStudentId(studentId);
        submission.setStudentName(studentName);
        submission.setAnswers(answers);
        submission.setScore(score);
        submission.setTotalMarks(assessment.getTotalMarks());
        submission.setPercentage((double) score / assessment.getTotalMarks() * 100);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus("GRADED");
        
        return submissionRepository.save(submission);
    }
    
    public List<AssessmentSubmission> getStudentSubmissions(String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }
    
    public Map<String, Object> getStudentProgress(String studentId) {
        List<AssessmentSubmission> submissions = submissionRepository.findByStudentId(studentId);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("totalAttempted", submissions.size());
        progress.put("averageScore", submissions.stream()
            .mapToDouble(AssessmentSubmission::getPercentage)
            .average()
            .orElse(0.0));
        progress.put("submissions", submissions);
        
        return progress;
    }
}
