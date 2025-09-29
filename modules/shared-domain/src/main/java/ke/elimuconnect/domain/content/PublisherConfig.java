package ke.elimuconnect.domain.content;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublisherConfig {
    private String name;
    private String apiEndpoint;
    private String apiKey;
    private boolean enabled;
    private String description;
}
