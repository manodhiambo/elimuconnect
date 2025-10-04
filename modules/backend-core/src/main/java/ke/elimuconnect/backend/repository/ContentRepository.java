package ke.elimuconnect.backend.repository;

import ke.elimuconnect.domain.Content;
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
    
    Page<Content> findByApprovedFalse(Pageable pageable);
    
    List<Content> findByUploadedByAndPublishedTrue(String uploadedBy);
    
    List<Content> findByUploadedBy(String uploadedBy);
    
    Page<Content> findByUploadedBy(String uploadedBy, Pageable pageable);
    
    Page<Content> findByUploadedByAndPublishedTrue(String uploadedBy, Pageable pageable);
    
    Page<Content> findByUploadedByAndPublishedFalse(String uploadedBy, Pageable pageable);
    
    @Query("{ $or: [ " +
           "{ 'title': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } }, " +
           "{ 'subject': { $regex: ?0, $options: 'i' } }, " +
           "{ 'tags': { $regex: ?0, $options: 'i' } } " +
           "], 'published': true }")
    Page<Content> searchByText(String searchText, Pageable pageable);
}

    Page<Content> findByPublishedTrue(Pageable pageable);
    Page<Content> findByTitleContainingIgnoreCaseAndPublishedTrue(String title, Pageable pageable);
    Page<Content> findBySubjectAndGradeAndPublishedTrue(String subject, String grade, Pageable pageable);
