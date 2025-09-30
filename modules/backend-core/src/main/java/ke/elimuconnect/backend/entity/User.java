package ke.elimuconnect.backend.entity;

import ke.elimuconnect.domain.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String name;
    private String password;
    private UserRole role;
    private boolean active;
    private boolean emailVerified;
    private String phoneNumber;
    private String profilePictureUrl;
    private String tscNumber;
    private String schoolId;
    private List<String> subjectsTaught;
    private List<String> classesAssigned;
    private String qualification;
    private String admissionNumber;
    private String className;
    private LocalDateTime dateOfBirth;
    private String parentGuardianContact;
    private String countyOfResidence;
    private String nationalId;
    private List<String> childrenAdmissionNumbers;
    private String relationshipToChildren;
    private String address;
    private String institutionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private int loginAttempts;
    private LocalDateTime lockedUntil;
}
