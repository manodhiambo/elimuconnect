package ke.elimuconnect.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contents")
public class Content {
    
    @Id
    private String id;
    
    @TextIndexed
    private String title;
    
    @TextIndexed
    private String description;
    
    private String contentType; // PDF, VIDEO, INTERACTIVE, AUDIO, BOOK, PAST_PAPER
    private String fileUrl;
    private String thumbnailUrl;
    private Long fileSizeBytes;
    private String mimeType;
    
    // CBC Curriculum Alignment
    private String subject;
    private String grade;
    private List<String> learningAreas;
    private List<String> strands;
    private List<String> subStrands;
    private List<String> learningOutcomes;
    
    // Publisher Information (for integrated publisher content)
    private String publisher; // e.g., "Oxford", "Longhorn", "KLB"
    private String isbn;
    private String edition;
    private String publishedYear;
    private boolean isPublisherContent; // true if from publisher API
    private String externalApiSource; // "oxford", "longhorn", "klb", etc.
    private Map<String, Object> publisherMetadata; // Additional publisher-specific data
    
    // Metadata
    private String author;
    private String uploadedBy; // User ID of uploader (teacher/admin)
    private String language; // EN, SW, etc.
    private List<String> tags;
    private String difficultyLevel; // BEGINNER, INTERMEDIATE, ADVANCED
    private Integer estimatedDurationMinutes;
    
    // Engagement metrics
    @Builder.Default
    private Long viewCount = 0L;
    
    @Builder.Default
    private Long downloadCount = 0L;
    
    @Builder.Default
    private Double averageRating = 0.0;
    
    @Builder.Default
    private Integer ratingCount = 0;
    
    // Access control
    private String accessLevel; // FREE, PREMIUM, SCHOOL_ONLY
    private List<String> allowedSchoolIds;
    private List<String> allowedGrades;
    
    // Status
    @Builder.Default
    private boolean published = false;
    
    @Builder.Default
    private boolean featured = false;
    
    private LocalDateTime publishedAt;
    
    @Builder.Default
    private boolean approved = false; // Admin approval for teacher uploads
    
    private String approvedBy; // Admin user ID
    private LocalDateTime approvedAt;
    
    // Offline support
    @Builder.Default
    private boolean offlineAvailable = false;
    
    private String offlinePackageUrl;
    
    // Audit
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
}
