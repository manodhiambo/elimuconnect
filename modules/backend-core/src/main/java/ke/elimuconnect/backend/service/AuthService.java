package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.repository.UserRepository;
import ke.elimuconnect.backend.security.JwtTokenProvider;
import ke.elimuconnect.domain.user.*;
import ke.elimuconnect.backend.exception.InvalidAdminCodeException;
import ke.elimuconnect.backend.exception.InvalidCredentialsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailNotificationService emailNotificationService;
    
    @Transactional
    public User registerAdmin(AdminRegistrationRequest request) {
        // Validate admin code
        if (!request.isValidAdminCode()) {
            throw new InvalidAdminCodeException("Invalid admin code");
        }
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ADMIN)
                .institutionId(request.getInstitutionId())
                .active(true)
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .build();
        
        return userRepository.save(user);
    }
    
    @Transactional
    public User registerTeacher(TeacherRegistrationRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(UserRole.TEACHER)
                .tscNumber(request.getTscNumber())
                .schoolId(request.getSchoolId())
                .subjectsTaught(request.getSubjectsTaught())
                .classesAssigned(request.getClassesAssigned())
                .qualification(request.getQualification())
                .active(false)
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);
        emailNotificationService.sendUserRegistrationNotification(savedUser);
        
        return savedUser;
    }
    
    @Transactional
    public User registerStudent(StudentRegistrationRequest request) {
        // Convert LocalDate to LocalDateTime if dateOfBirth is not null
        LocalDateTime dateOfBirthDateTime = request.getDateOfBirth() != null 
            ? request.getDateOfBirth().atStartOfDay() 
            : null;
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.STUDENT)
                .admissionNumber(request.getAdmissionNumber())
                .schoolId(request.getSchoolId())
                .className(request.getClassName())
                .dateOfBirth(dateOfBirthDateTime)
                .parentGuardianContact(request.getParentGuardianContact())
                .countyOfResidence(request.getCountyOfResidence())
                .active(false)
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);
        emailNotificationService.sendUserRegistrationNotification(savedUser);
        
        return savedUser;
    }
    
    @Transactional
    public User registerParent(ParentRegistrationRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(UserRole.PARENT)
                .nationalId(request.getNationalId())
                .childrenAdmissionNumbers(request.getChildrenAdmissionNumbers())
                .relationshipToChildren(request.getRelationshipToChildren())
                .address(request.getAddress())
                .active(false)
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);
        emailNotificationService.sendUserRegistrationNotification(savedUser);
        
        return savedUser;
    }
    
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }
        
        if (!user.isActive()) {
            throw new InvalidCredentialsException("Account is not activated. Please wait for approval.");
        }
        
        return tokenProvider.generateToken(user);
    }
}
