package ke.elimuconnect.domain.user;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRegistrationRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    @Pattern(regexp = "^\\+254[0-9]{9}$", message = "Invalid Kenyan phone number")
    private String phoneNumber;
    
    @NotBlank(message = "TSC number is required")
    private String tscNumber;
    
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotEmpty(message = "At least one subject must be selected")
    private List<String> subjectsTaught;
    
    @NotEmpty(message = "At least one class must be assigned")
    private List<String> classesAssigned;
    
    @NotBlank(message = "Qualification is required")
    private String qualification;
}
