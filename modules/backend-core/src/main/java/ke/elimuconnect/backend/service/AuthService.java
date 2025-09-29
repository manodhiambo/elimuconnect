package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.exception.DuplicateResourceException;
import ke.elimuconnect.backend.exception.InvalidAdminCodeException;
import ke.elimuconnect.backend.exception.InvalidCredentialsException;
import ke.elimuconnect.backend.repository.UserRepository;
import ke.elimuconnect.backend.security.JwtTokenProvider;
import ke.elimuconnect.domain.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    
    @Transactional
    public User registerAdmin(AdminRegistrationRequest request) {
        log.info("Attempting to register admin with email: {}", request.getEmail());
        
        if (!request.isValidAdminCode()) {
            throw new InvalidAdminCodeException("Invalid admin code");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with this email already exists");
        }
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ADMIN)
                .institutionId(request.getInstitutionId())
                .active(true)
                .emailVerified(true)
                .build();
        
        User savedUser = userRepository.save(user);
        emailService.sendWelcomeEmail(savedUser);
        
        log.info("Admin registered successfully with ID: {}", savedUser.getId());
        return savedUser;
    }
    
    @Transactional
    public User registerTeacher(TeacherRegistrationRequest request) {
        log.info("Attempting to register teacher with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with this email already exists");
        }
        
        if (userRepository.findByTscNumber(request.getTscNumber()).isPresent()) {
            throw new DuplicateResourceException("Teacher with this TSC number already exists");
        }
        
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
                .build();
        
        User savedUser = userRepository.save(user);
        emailService.sendVerificationEmail(savedUser);
        
        log.info("Teacher registered successfully with ID: {} - Pending approval", savedUser.getId());
        return savedUser;
    }
    
    @Transactional
    public User registerStudent(StudentRegistrationRequest request) {
        log.info("Attempting to register student with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with this email already exists");
        }
        
        if (userRepository.findByAdmissionNumber(request.getAdmissionNumber()).isPresent()) {
            throw new DuplicateResourceException("Student with this admission number already exists");
        }
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.STUDENT)
                .admissionNumber(request.getAdmissionNumber())
                .schoolId(request.getSchoolId())
                .className(request.getClassName())
                .dateOfBirth(request.getDateOfBirth())
                .parentGuardianContact(request.getParentGuardianContact())
                .countyOfResidence(request.getCountyOfResidence())
                .active(false)
                .emailVerified(false)
                .build();
        
        User savedUser = userRepository.save(user);
        emailService.sendVerificationEmail(savedUser);
        
        log.info("Student registered successfully with ID: {} - Pending verification", savedUser.getId());
        return savedUser;
    }
    
    @Transactional
    public User registerParent(ParentRegistrationRequest request) {
        log.info("Attempting to register parent with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with this email already exists");
        }
        
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
                .build();
        
        User savedUser = userRepository.save(user);
        emailService.sendVerificationEmail(savedUser);
        
        log.info("Parent registered successfully with ID: {} - Pending verification", savedUser.getId());
        return savedUser;
    }
    
    @Transactional
    public String login(String email, String password) {
        log.info("Login attempt for email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Account is locked. Please try again later.");
        }
        
        if (!user.isActive()) {
            throw new InvalidCredentialsException("Account is not active. Please contact administrator.");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            user.setLoginAttempts(user.getLoginAttempts() + 1);
            
            if (user.getLoginAttempts() >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusHours(1));
                log.warn("Account locked for user: {} due to multiple failed login attempts", email);
            }
            
            userRepository.save(user);
            throw new InvalidCredentialsException("Invalid email or password");
        }
        
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        String token = tokenProvider.generateToken(user);
        log.info("User logged in successfully: {}", email);
        
        return token;
    }
}
