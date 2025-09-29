package ke.elimuconnect.backend.entity;

import ke.elimuconnect.domain.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
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
    
    @Builder.Default
    private boolean active = false;
    
    @Builder.Default
    private boolean emailVerified = false;
    
    // Common fields
    private String phoneNumber;
    private String profilePictureUrl;
    
    // Teacher-specific fields
    private String tscNumber;
    private String schoolId;
    private List<String> subjectsTaught;
    private List<String> classesAssigned;
    private String qualification;
    
    // Student-specific fields
    private String admissionNumber;
    private String className;
    private LocalDate dateOfBirth;
    private String parentGuardianContact;
    private String countyOfResidence;
    
    // Parent-specific fields
    private String nationalId;
    private List<String> childrenAdmissionNumbers;
    private String relationshipToChildren;
    private String address;
    
    // Admin-specific fields
    private String institutionId;
    
    // Audit fields
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
    
    // Security metadata
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    
    @Builder.Default
    private int loginAttempts = 0;
    
    private LocalDateTime lockedUntil;
}
