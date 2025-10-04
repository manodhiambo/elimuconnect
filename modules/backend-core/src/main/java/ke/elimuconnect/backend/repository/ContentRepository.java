package ke.elimuconnect.backend.repository;

import ke.elimuconnect.domain.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentRepository extends MongoRepository<Content, String> {
    // Basic queries
    List<Content> findByUploadedBy(String uploadedBy);
    Optional<Content> findByTitleAndUploadedBy(String title, String uploadedBy);
    List<Content> findByPublished(boolean published);
    
    // Published content queries
    Page<Content> findByPublishedTrue(Pageable pageable);
    List<Content> findByUploadedByAndPublishedTrue(String uploadedBy);
    
    // Approval queries (if Content has approved field)
    Page<Content> findByApprovedFalse(Pageable pageable);
    
    // Search queries
    Page<Content> findByTitleContainingIgnoreCaseAndPublishedTrue(String title, Pageable pageable);
    Page<Content> findBySubjectAndGradeAndPublishedTrue(String subject, String grade, Pageable pageable);
    
    // Text search using MongoDB text index
    @Query("{ $text: { $search: ?0 }, published: true }")
    Page<Content> searchByText(String searchText, Pageable pageable);
}
    
