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
public class ParentRegistrationRequest {
    
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
    
    @NotBlank(message = "National ID is required")
    @Pattern(regexp = "^[0-9]{7,8}$", message = "Invalid Kenyan National ID")
    private String nationalId;
    
    @NotEmpty(message = "At least one child admission number is required")
    private List<String> childrenAdmissionNumbers;
    
    @NotBlank(message = "Relationship to children is required")
    private String relationshipToChildren;
    
    @NotBlank(message = "Address is required")
    private String address;
}
