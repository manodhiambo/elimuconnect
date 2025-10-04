package ke.elimuconnect.backend.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "assessments")
public class Assessment {
    @Id
    private String id;
    private String title;
    private String description;
    private String subject;
    private String grade;
    private String teacherId;
    private String teacherName;
    private Integer duration; // in minutes
    private Integer totalMarks;
    private Integer passingMarks;
    private List<Question> questions;
    private LocalDateTime createdAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean published;
    
    @Data
    public static class Question {
        private String id;
        private String text;
        private String type; // MCQ, TRUE_FALSE, SHORT_ANSWER
        private List<String> options;
        private String correctAnswer;
        private Integer marks;
    }
}
