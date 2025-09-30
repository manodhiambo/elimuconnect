package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends MongoRepository<Content, String> {
    
    Page<Content> findByPublished(boolean published, Pageable pageable);
    
    Page<Content> findByPublishedTrue(Pageable pageable);
    
    Page<Content> findBySubject(String subject, Pageable pageable);
    
    Page<Content> findByGrade(String grade, Pageable pageable);
    
    Page<Content> findBySubjectAndGrade(String subject, String grade, Pageable pageable);
    
    Page<Content> findBySubjectAndGradeAndPublishedTrue(String subject, String grade, Pageable pageable);
    
    Page<Content> findByApprovedFalse(Pageable pageable);
    
    List<Content> findByUploadedByAndPublishedTrue(String uploadedBy);
    
    @Query("{ $text: { $search: ?0 } }")
    Page<Content> searchByText(String searchText, Pageable pageable);
}
