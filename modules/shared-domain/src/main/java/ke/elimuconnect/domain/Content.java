package ke.elimuconnect.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {
    private String id;
    private String title;
    private String description;
    private String subject;
    private String grade;
    private String contentType;
    private String fileUrl;
    private String thumbnailUrl;
    private String author;
    private boolean published;
    private int viewCount;
    private int downloadCount;
    private String createdAt;
    private String updatedAt;
    
    // Additional fields needed by services
    private Long fileSizeBytes;
    private boolean approved;
    private String approvedBy;
    private String approvedAt;
    private String publishedAt;
    private String uploadedBy;
    private String createdBy;
    private String publisher;
    private List<String> tags;
}
