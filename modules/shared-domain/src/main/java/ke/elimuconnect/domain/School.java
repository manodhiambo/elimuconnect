package ke.elimuconnect.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class School {
    private String id;
    private String nemisCode;
    private String name;
    private String type;
    private String category;
    private String county;
    private String subCounty;
    private String ward;
    private String location;
    private Double latitude;
    private Double longitude;
    private String phoneNumber;
    private String email;
    private String principalName;
    private String principalContact;
    private List<String> grades;
    private List<String> streams;
    private Integer totalStudents;
    private Integer totalTeachers;
    private boolean hasElectricity;
    private boolean hasInternet;
    private boolean hasComputerLab;
    private boolean hasLibrary;
    private Integer numberOfComputers;
    private boolean active;
    private String subscriptionTier;
    private String createdAt;
    private String updatedAt;
}
