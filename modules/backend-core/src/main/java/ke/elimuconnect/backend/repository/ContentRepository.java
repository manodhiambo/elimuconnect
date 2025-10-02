package ke.elimuconnect.backend.repository;

import ke.elimuconnect.domain.Content;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentRepository extends MongoRepository<Content, String> {
}
