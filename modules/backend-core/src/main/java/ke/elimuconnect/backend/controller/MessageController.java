package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.Message;
import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.repository.UserRepository;
import ke.elimuconnect.backend.service.MessageService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {
    
    private final MessageService messageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> conversations = messageService.getConversationList(user.getId());
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }
    
    @GetMapping("/conversation/{partnerId}")
    public ResponseEntity<ApiResponse<Page<Message>>> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Page<Message> messages = messageService.getConversation(
            user.getId(), partnerId, 
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
    
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String senderId = user.getId();
        String receiverId = request.get("receiverId");
        String content = request.get("content");
        
        Message message = messageService.sendMessage(senderId, receiverId, content);
        
        // Send to receiver via WebSocket
        messagingTemplate.convertAndSendToUser(
            receiverId, 
            "/queue/messages", 
            message
        );
        
        return ResponseEntity.ok(ApiResponse.success(message));
    }
    
    @PostMapping("/mark-read/{partnerId}")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String partnerId) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        messageService.markAsRead(user.getId(), partnerId);
        return ResponseEntity.ok(ApiResponse.success(null, "Messages marked as read"));
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        long count = messageService.countUnreadMessages(user.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
