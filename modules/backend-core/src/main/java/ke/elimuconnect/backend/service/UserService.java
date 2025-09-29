package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.exception.ResourceNotFoundException;
import ke.elimuconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;  // Add this
    
    public List<User> getPendingApprovalUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !user.isActive())
                .toList();
    }
    
    @Transactional
    public User approveUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setActive(true);
        user.setEmailVerified(true);
        
        User approvedUser = userRepository.save(user);
        emailService.sendApprovalEmail(approvedUser);  // Now this will work
        
        log.info("User approved: {}", userId);
        return approvedUser;
    }
    
    @Transactional
    public void rejectUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        userRepository.delete(user);
        log.info("User rejected and deleted: {}", userId);
    }
    
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
