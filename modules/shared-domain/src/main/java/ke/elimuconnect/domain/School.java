package ke.elimuconnect.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "schools")
public class School {
    @Id
    private String id;
    private String name;
    private String county;
    private String subCounty;
    private String type; // PUBLIC, PRIVATE, BOARDING, DAY
    private String level; // PRIMARY, SECONDARY
    private String principal;
    private String email;
    private String phone;
    private Integer studentCount;
}
