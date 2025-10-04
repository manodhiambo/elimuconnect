package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.AssessmentSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface AssessmentSubmissionRepository extends MongoRepository<AssessmentSubmission, String> {
    List<AssessmentSubmission> findByStudentId(String studentId);
    Optional<AssessmentSubmission> findByAssessmentIdAndStudentId(String assessmentId, String studentId);
    List<AssessmentSubmission> findByAssessmentId(String assessmentId);
}
