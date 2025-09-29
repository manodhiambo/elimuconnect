package ke.elimuconnect.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "schools")
public class School {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String nemisCode;
    
    private String name;
    private String type; // PRIMARY, SECONDARY, MIXED
    private String category; // PUBLIC, PRIVATE, FAITH_BASED
    
    // Location
    private String county;
    private String subCounty;
    private String ward;
    private String location;
    private Double latitude;
    private Double longitude;
    
    // Contact
    private String phoneNumber;
    private String email;
    private String principalName;
    private String principalContact;
    
    // Academic
    private List<String> grades;
    private List<String> streams;
    private Integer totalStudents;
    private Integer totalTeachers;
    
    // Infrastructure
    @Builder.Default
    private boolean hasElectricity = false;
    
    @Builder.Default
    private boolean hasInternet = false;
    
    @Builder.Default
    private boolean hasComputerLab = false;
    
    @Builder.Default
    private boolean hasLibrary = false;
    
    private Integer numberOfComputers;
    
    // Status
    @Builder.Default
    private boolean active = true;
    
    @Builder.Default
    private String subscriptionTier = "FREE";
    
    private LocalDateTime subscriptionExpiresAt;
    
    // Audit
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
