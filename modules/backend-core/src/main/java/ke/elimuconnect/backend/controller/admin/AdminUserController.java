package ke.elimuconnect.backend.controller.admin;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.service.AdminUserService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    
    private final AdminUserService adminUserService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role) {
        
        Page<User> users = adminUserService.getAllUsers(
            PageRequest.of(page, size), role);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Page<User>>> getPendingUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<User> users = adminUserService.getPendingUsers(
            PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id) {
        User user = adminUserService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<User>> approveUser(@PathVariable String id) {
        User user = adminUserService.approveUser(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectUser(
            @PathVariable String id,
            @RequestBody RejectRequest request) {
        adminUserService.rejectUser(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<User>> activateUser(@PathVariable String id) {
        User user = adminUserService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<User>> deactivateUser(@PathVariable String id) {
        User user = adminUserService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    public static class RejectRequest {
        private String reason;
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
