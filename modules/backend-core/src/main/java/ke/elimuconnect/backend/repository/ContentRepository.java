package ke.elimuconnect.backend.repository;

import ke.elimuconnect.domain.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentRepository extends MongoRepository<Content, String> {
    List<Content> findByUploadedBy(String uploadedBy);
    Optional<Content> findByTitleAndUploadedBy(String title, String uploadedBy);
    List<Content> findByPublished(boolean published);
    Page<Content> findByPublishedTrue(Pageable pageable);
    Page<Content> findByTitleContainingIgnoreCaseAndPublishedTrue(String title, Pageable pageable);
    Page<Content> findBySubjectAndGradeAndPublishedTrue(String subject, String grade, Pageable pageable);
}
