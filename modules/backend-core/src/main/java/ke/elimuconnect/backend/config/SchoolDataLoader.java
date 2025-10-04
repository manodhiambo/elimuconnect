package ke.elimuconnect.backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ke.elimuconnect.backend.entity.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchoolDataLoader implements CommandLineRunner {
    
    private final SchoolRepository schoolRepository;
    private final ObjectMapper objectMapper;
    
    @Override
    public void run(String... args) throws Exception {
        if (schoolRepository.count() > 0) {
            log.info("Schools already exist in database. Skipping data load.");
            return;
        }
        
        log.info("Loading school data from schools-data.json...");
        
        try {
            InputStream inputStream = new ClassPathResource("schools-data.json").getInputStream();
            List<School> schools = objectMapper.readValue(inputStream, new TypeReference<List<School>>() {});
            
            schoolRepository.saveAll(schools);
            log.info("Successfully loaded {} schools into database", schools.size());
            
        } catch (Exception e) {
            log.error("Failed to load school data", e);
        }
    }
}
