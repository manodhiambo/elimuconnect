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
        
        // Try to send approval email, but don't fail if it doesn't work
        try {
            // TODO: Implement email notification when email service is configured
            log.info("User approved: {} ({}) - Email notification pending implementation", 
                user.getEmail(), user.getRole());
        } catch (Exception e) {
            log.error("Failed to send approval email to {}: {}", user.getEmail(), e.getMessage());
        }
        
        return savedUser;
    }

    @Transactional
    public void rejectUser(String id, String reason) {
        User user = getUserById(id);
        
        // Try to send rejection email, but don't fail if it doesn't work
        try {
            // TODO: Implement email notification when email service is configured
            log.info("User rejected: {} - Reason: {} - Email notification pending implementation", 
                user.getEmail(), reason);
        } catch (Exception e) {
            log.error("Failed to send rejection email to {}: {}", user.getEmail(), e.getMessage());
        }
        
        // Delete the user
        userRepository.delete(user);
        log.info("User rejected and deleted: {}", user.getEmail());
    }
}
