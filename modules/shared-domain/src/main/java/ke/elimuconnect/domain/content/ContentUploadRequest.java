package ke.elimuconnect.domain.content;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentUploadRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Content type is required")
    private String contentType; // PDF, VIDEO, BOOK, PAST_PAPER
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Grade is required")
    private String grade;
    
    private List<String> learningAreas;
    private List<String> strands;
    private List<String> subStrands;
    private List<String> learningOutcomes;
    
    private String author;
    private String language;
    private List<String> tags;
    private String difficultyLevel;
    private Integer estimatedDurationMinutes;
    
    private String accessLevel;
    private List<String> allowedSchoolIds;
    private List<String> allowedGrades;
    
    // File will be uploaded separately via multipart
    @NotBlank(message = "File URL is required after upload")
    private String fileUrl;
    
    private String thumbnailUrl;
    private Long fileSizeBytes;
    private String mimeType;
}
