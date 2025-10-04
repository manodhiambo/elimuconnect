package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.Message;
import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.backend.repository.MessageRepository;
import ke.elimuconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    
    public Message sendMessage(String senderId, String receiverId, String content) {
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        Message message = Message.builder()
            .senderId(senderId)
            .senderName(sender.getName())
            .receiverId(receiverId)
            .receiverName(receiver.getName())
            .content(content)
            .messageType("TEXT")
            .read(false)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        return messageRepository.save(message);
    }
    
    public Page<Message> getConversation(String userId1, String userId2, Pageable pageable) {
        return messageRepository.findConversation(userId1, userId2, pageable);
    }
    
    public Map<String, Object> getConversationList(String userId) {
        List<Message> allMessages = messageRepository.findBySenderIdOrReceiverId(userId, userId);
        
        // Group by conversation partner
        Map<String, List<Message>> grouped = allMessages.stream()
            .collect(Collectors.groupingBy(m -> 
                m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId()
            ));
        
        List<Map<String, Object>> conversations = new ArrayList<>();
        for (Map.Entry<String, List<Message>> entry : grouped.entrySet()) {
            String partnerId = entry.getKey();
            List<Message> messages = entry.getValue();
            
            // Get latest message
            Message latest = messages.stream()
                .max(Comparator.comparing(Message::getCreatedAt))
                .orElse(null);
            
            // Count unread
            long unreadCount = messages.stream()
                .filter(m -> m.getReceiverId().equals(userId) && !m.isRead())
                .count();
            
            Map<String, Object> conv = new HashMap<>();
            conv.put("partnerId", partnerId);
            conv.put("partnerName", latest.getSenderId().equals(userId) ? 
                latest.getReceiverName() : latest.getSenderName());
            conv.put("lastMessage", latest.getContent());
            conv.put("lastMessageTime", latest.getCreatedAt());
            conv.put("unreadCount", unreadCount);
            
            conversations.add(conv);
        }
        
        // Sort by last message time
        conversations.sort((a, b) -> 
            ((LocalDateTime) b.get("lastMessageTime"))
                .compareTo((LocalDateTime) a.get("lastMessageTime"))
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("conversations", conversations);
        result.put("totalUnread", countUnreadMessages(userId));
        
        return result;
    }
    
    public long countUnreadMessages(String userId) {
        return messageRepository.countByReceiverIdAndReadFalse(userId);
    }
    
    public void markAsRead(String userId, String partnerId) {
        List<Message> unread = messageRepository.findUnreadMessages(userId, partnerId);
        unread.forEach(m -> m.setRead(true));
        messageRepository.saveAll(unread);
    }
}
