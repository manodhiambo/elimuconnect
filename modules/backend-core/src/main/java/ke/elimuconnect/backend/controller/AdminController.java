package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.repository.UserRepository;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UserRepository userRepository;
    
    @GetMapping("/users/pending")
    public ResponseEntity<ApiResponse<Page<User>>> getPendingUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<User> pendingUsers = userRepository.findByActive(
                false, 
                PageRequest.of(page, size)
        );
        
        return ResponseEntity.ok(ApiResponse.success(pendingUsers));
    }
    
    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<ApiResponse<User>> approveUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        
        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(updated, "User approved successfully"));
    }
    
    @PostMapping("/users/{userId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectUser(
            @PathVariable String userId,
            @RequestBody(required = false) String reason) {
        
        userRepository.deleteById(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "User rejected"));
    }
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<User> users = userRepository.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
