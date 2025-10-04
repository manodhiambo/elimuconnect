package ke.elimuconnect.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String name;
    private String email;
    private String password;
    private String role;
    private String schoolId;
    private String admissionNumber;
    private String className;
    private String dateOfBirth;
    private String parentGuardianContact;
    private String countyOfResidence;
    private String approvalStatus;
    private boolean active;
    private String createdAt;
    private String updatedAt;
    private String createdBy;
    private String updatedBy;
}
