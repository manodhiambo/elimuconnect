package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    // Get conversation between two users
    @Query("{ $or: [ " +
           "  { senderId: ?0, receiverId: ?1 }, " +
           "  { senderId: ?1, receiverId: ?0 } " +
           "] }")
    Page<Message> findConversation(String userId1, String userId2, Pageable pageable);
    
    // Get all conversations for a user (distinct users they've messaged)
    List<Message> findBySenderIdOrReceiverId(String senderId, String receiverId);
    
    // Count unread messages for a user
    long countByReceiverIdAndReadFalse(String receiverId);
    
    // Mark messages as read
    @Query("{ receiverId: ?0, senderId: ?1, read: false }")
    List<Message> findUnreadMessages(String receiverId, String senderId);
}
