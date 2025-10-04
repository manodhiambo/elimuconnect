package ke.elimuconnect.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String id;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String content;
    private String messageType; // TEXT, IMAGE, FILE
    private boolean read;
    private String createdAt;
    private String updatedAt;
}
