package ke.elimuconnect.backend.repository;

import ke.elimuconnect.domain.School;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolRepository extends MongoRepository<School, String> {
    List<School> findByNameContainingIgnoreCase(String name);
    List<School> findByCounty(String county);
}
