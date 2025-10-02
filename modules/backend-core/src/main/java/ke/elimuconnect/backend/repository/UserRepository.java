package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    long deleteByEmail(String email);
    
    Page<User> findByActive(boolean active, Pageable pageable);
    
    Page<User> findAll(Pageable pageable);
}
