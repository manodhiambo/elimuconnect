package ke.elimuconnect.backend.controller.admin;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.service.AdminUserService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    
    private final AdminUserService adminUserService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "role", required = false) String role) {
        
        Page<User> users = adminUserService.getAllUsers(
            PageRequest.of(page, size), role);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Page<User>>> getPendingUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        try {
            log.info("Fetching pending users - page: {}, size: {}", page, size);
            Page<User> users = adminUserService.getPendingUsers(
                PageRequest.of(page, size));
            log.info("Found {} pending users", users.getTotalElements());
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            log.error("Error fetching pending users", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error fetching pending users: " + e.getMessage()));
        }
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
    public ResponseEntity<ApiResponse<Void>> rejectUser(@PathVariable String id) {
        adminUserService.rejectUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User rejected successfully"));
    }
}
