package ke.elimuconnect.backend.service;

import ke.elimuconnect.domain.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolService {
    
    private final SchoolRepository schoolRepository;
    
    public List<School> getAllSchools() {
        return schoolRepository.findAll();
    }
    
    public List<School> searchSchools(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllSchools();
        }
        return schoolRepository.findByNameContainingIgnoreCase(query.trim());
    }
    
    public Optional<School> getSchoolById(String id) {
        return schoolRepository.findById(id);
    }
}
