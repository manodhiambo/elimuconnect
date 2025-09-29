package ke.elimuconnect.domain.user;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    @NotBlank(message = "Admission number is required")
    private String admissionNumber;
    
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Class name is required")
    private String className;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    @NotBlank(message = "Parent/Guardian contact is required")
    @Pattern(regexp = "^\\+254[0-9]{9}$", message = "Invalid Kenyan phone number")
    private String parentGuardianContact;
    
    @NotBlank(message = "County of residence is required")
    private String countyOfResidence;
}
