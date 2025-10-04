package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    List<User> findBySchoolId(String schoolId);
    Optional<User> findByAdmissionNumber(String admissionNumber);
    List<User> findByApprovalStatus(String approvalStatus);
    long countByApprovalStatus(String status);
    long countByActive(boolean active);
}
