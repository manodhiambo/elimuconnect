package ke.elimuconnect.backend.repository;

import ke.elimuconnect.domain.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends MongoRepository<School, String> {
    Optional<School> findByNemisCode(String nemisCode);
    List<School> findByActiveTrue();
    Page<School> findByActiveTrue(Pageable pageable);
    List<School> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}
