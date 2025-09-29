package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.service.AuthService;
import ke.elimuconnect.domain.common.ApiResponse;
import ke.elimuconnect.domain.user.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse<User>> registerAdmin(
            @Valid @RequestBody AdminRegistrationRequest request) {
        User user = authService.registerAdmin(request);
        return ResponseEntity.ok(ApiResponse.success(user, "Admin registered successfully"));
    }
    
    @PostMapping("/register/teacher")
    public ResponseEntity<ApiResponse<User>> registerTeacher(
            @Valid @RequestBody TeacherRegistrationRequest request) {
        User user = authService.registerTeacher(request);
        return ResponseEntity.ok(ApiResponse.success(user, 
                "Teacher registered successfully. Pending admin approval."));
    }
    
    @PostMapping("/register/student")
    public ResponseEntity<ApiResponse<User>> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest request) {
        User user = authService.registerStudent(request);
        return ResponseEntity.ok(ApiResponse.success(user, 
                "Student registered successfully. Pending verification."));
    }
    
    @PostMapping("/register/parent")
    public ResponseEntity<ApiResponse<User>> registerParent(
            @Valid @RequestBody ParentRegistrationRequest request) {
        User user = authService.registerParent(request);
        return ResponseEntity.ok(ApiResponse.success(user, 
                "Parent registered successfully. Pending verification."));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(
            @Valid @RequestBody LoginRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success(token, "Login successful"));
    }
}
