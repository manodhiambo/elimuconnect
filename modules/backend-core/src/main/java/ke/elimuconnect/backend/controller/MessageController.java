package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.Message;
import ke.elimuconnect.backend.service.MessageService;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {
    
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            String userId = userDetails.getUsername();
            log.info("Getting conversations for userId: {}", userId);
            
            Map<String, Object> conversations = messageService.getConversationList(userId);
            return ResponseEntity.ok(ApiResponse.success(conversations));
        } catch (Exception e) {
            log.error("Error getting conversations", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/conversation/{partnerId}")
    public ResponseEntity<ApiResponse<Page<Message>>> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        try {
            String userId = userDetails.getUsername();
            log.info("Getting conversation between {} and {}", userId, partnerId);
            
            Page<Message> messages = messageService.getConversation(
                userId, partnerId, 
                PageRequest.of(page, size, Sort.by("createdAt").descending())
            );
            
            log.info("Found {} messages", messages.getTotalElements());
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            log.error("Error getting conversation between user and partner {}", partnerId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        
        try {
            String senderId = userDetails.getUsername();
            String receiverId = request.get("receiverId");
            String content = request.get("content");
            
            log.info("Sending message from {} to {}", senderId, receiverId);
            
            Message message = messageService.sendMessage(senderId, receiverId, content);
            
            // Send to receiver via WebSocket
            messagingTemplate.convertAndSendToUser(
                receiverId, 
                "/queue/messages", 
                message
            );
            
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (Exception e) {
            log.error("Error sending message", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/mark-read/{partnerId}")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String partnerId) {
        
        try {
            String userId = userDetails.getUsername();
            log.info("Marking messages as read between {} and {}", userId, partnerId);
            
            messageService.markAsRead(userId, partnerId);
            return ResponseEntity.ok(ApiResponse.success(null, "Messages marked as read"));
        } catch (Exception e) {
            log.error("Error marking messages as read", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            String userId = userDetails.getUsername();
            long count = messageService.countUnreadMessages(userId);
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            log.error("Error getting unread count", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
}
