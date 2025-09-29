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
    
    Page<Content> findByPublishedTrue(Pageable pageable);
    
    Page<Content> findBySubjectAndGradeAndPublishedTrue(String subject, String grade, Pageable pageable);
    
    Page<Content> findByContentTypeAndPublishedTrue(String contentType, Pageable pageable);
    
    List<Content> findByUploadedByAndPublishedTrue(String uploadedBy);
    
    List<Content> findByUploadedByAndApprovedFalse(String uploadedBy);
    
    Page<Content> findByApprovedFalse(Pageable pageable);
    
    @Query("{ 'published': true, 'tags': { $in: ?0 } }")
    Page<Content> findByTags(List<String> tags, Pageable pageable);
    
    @Query("{ 'published': true, $text: { $search: ?0 } }")
    Page<Content> searchByText(String searchText, Pageable pageable);
    
    List<Content> findByIsPublisherContentTrue();
    
    List<Content> findByPublisher(String publisher);
}
