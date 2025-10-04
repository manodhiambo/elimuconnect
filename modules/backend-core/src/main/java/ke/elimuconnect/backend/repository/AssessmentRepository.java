package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.Assessment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    Page<Assessment> findByPublishedTrue(Pageable pageable);
    Page<Assessment> findBySubjectAndGradeAndPublishedTrue(String subject, String grade, Pageable pageable);
    List<Assessment> findByTeacherId(String teacherId);
}
