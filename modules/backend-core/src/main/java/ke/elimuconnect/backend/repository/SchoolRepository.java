package ke.elimuconnect.backend.repository;

import ke.elimuconnect.backend.entity.School;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends MongoRepository<School, String> {
    
    Optional<School> findByNemisCode(String nemisCode);
    
    boolean existsByNemisCode(String nemisCode);
    
    List<School> findByCounty(String county);
    
    List<School> findByTypeAndActive(String type, boolean active);
    
    List<School> findByActive(boolean active);
}
