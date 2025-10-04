package ke.elimuconnect.backend.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "assessment_submissions")
public class AssessmentSubmission {
    @Id
    private String id;
    private String assessmentId;
    private String studentId;
    private String studentName;
    private Map<String, String> answers; // questionId -> answer
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private LocalDateTime submittedAt;
    private String status; // SUBMITTED, GRADED
}
