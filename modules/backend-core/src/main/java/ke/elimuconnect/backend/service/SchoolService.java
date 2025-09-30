package ke.elimuconnect.backend.service;

import ke.elimuconnect.domain.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SchoolService {
    private final SchoolRepository schoolRepository;

    public List<School> getAllSchools() {
        return schoolRepository.findAll();
    }

    public List<School> searchSchools(String query) {
        return schoolRepository.findByNameContainingIgnoreCase(query);
    }

    public Optional<School> getSchoolById(String id) {
        return schoolRepository.findById(id);
    }
}
