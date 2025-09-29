package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.domain.user.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    List<User> findBySchoolIdAndRole(String schoolId, UserRole role);
    
    List<User> findBySchoolIdAndRoleAndActive(String schoolId, UserRole role, boolean active);
    
    Optional<User> findByAdmissionNumber(String admissionNumber);
    
    Optional<User> findByTscNumber(String tscNumber);
    
    List<User> findByChildrenAdmissionNumbersContaining(String admissionNumber);
}
