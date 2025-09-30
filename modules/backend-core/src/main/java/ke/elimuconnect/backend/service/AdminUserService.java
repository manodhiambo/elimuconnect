package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.exception.ResourceNotFoundException;
import ke.elimuconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {
    
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;
    
    public Page<User> getAllUsers(Pageable pageable, String role) {
        if (role != null && !role.isEmpty()) {
            return userRepository.findByRole(role, pageable);
        }
        return userRepository.findAll(pageable);
    }
    
    public Page<User> getPendingUsers(Pageable pageable) {
        return userRepository.findByActive(false, pageable);
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    @Transactional
    public User approveUser(String id) {
        User user = getUserById(id);
        user.setActive(true);
        user.setEmailVerified(true);
        User savedUser = userRepository.save(user);
        
        // Send approval email
        emailNotificationService.sendUserApprovalEmail(savedUser);
        
        log.info("User approved: {} ({})", user.getEmail(), user.getRole());
        return savedUser;
    }
    
    @Transactional
    public void rejectUser(String id, String reason) {
        User user = getUserById(id);
        
        // Send rejection email
        emailNotificationService.sendUserRejectionEmail(user, reason);
        
        // Delete the user
        userRepository.delete(user);
        
        log.info("User rejected and deleted: {} ({})", user.getEmail(), user.getRole());
    }
    
    @Transactional
    public User activateUser(String id) {
        User user = getUserById(id);
        user.setActive(true);
        return userRepository.save(user);
    }
    
    @Transactional
    public User deactivateUser(String id) {
        User user = getUserById(id);
        user.setActive(false);
        return userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(String id) {
        User user = getUserById(id);
        userRepository.delete(user);
        log.info("User deleted: {}", user.getEmail());
    }
}
