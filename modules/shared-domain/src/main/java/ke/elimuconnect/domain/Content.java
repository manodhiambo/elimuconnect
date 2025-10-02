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
    private String mimeType;
    private String fileUrl;
    private String thumbnailUrl;
    private String author;
    private String publisher;
    private String isbn;
    private boolean published;
    private String publishedAt;
    private boolean approved;
    private String approvedBy;
    private String approvedAt;
    private int viewCount;
    private int downloadCount;
    private Long fileSizeBytes;
    private String uploadedBy;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
    private List<String> tags;
}
