package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.service.PublisherIntegrationService;
import ke.elimuconnect.backend.service.UserService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UserService userService;
    private final PublisherIntegrationService publisherIntegrationService;
    
    @GetMapping("/users/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingUsers() {
        List<User> users = userService.getPendingApprovalUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<ApiResponse<User>> approveUser(@PathVariable String userId) {
        User user = userService.approveUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user, "User approved successfully"));
    }
    
    @PutMapping("/users/{userId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectUser(@PathVariable String userId) {
        userService.rejectUser(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "User rejected"));
    }
    
    @PostMapping("/sync-publishers")
    public ResponseEntity<ApiResponse<Void>> syncPublishers() {
        publisherIntegrationService.syncAllPublishers();
        return ResponseEntity.ok(ApiResponse.success(null, "Publisher sync initiated"));
    }
}
