package ke.elimuconnect.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class School {
    private String id;
    private String name;
    private String nemisCode;
    private String type;
    private String level;
    private String county;
    private String subCounty;
    private String ward;
    private String location;
    private String phoneNumber;
    private String email;
    private String principalName;
    private String principalContact;
    private boolean active;
    private String createdAt;
    private String updatedAt;
    private String createdBy;
    private String updatedBy;
}
