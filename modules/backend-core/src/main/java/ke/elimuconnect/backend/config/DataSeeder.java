package ke.elimuconnect.backend.config;

import ke.elimuconnect.domain.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    
    private final SchoolRepository schoolRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (schoolRepository.count() == 0) {
            seedSchools();
        }
    }
    
    private void seedSchools() {
        List<School> schools = Arrays.asList(
            School.builder()
                .nemisCode("001001001")
                .name("Nairobi Primary School")
                .type("PRIMARY")
                .category("PUBLIC")
                .county("Nairobi")
                .subCounty("Westlands")
                .ward("Parklands")
                .location("Parklands, Nairobi")
                .latitude(-1.2634)
                .longitude(36.8081)
                .phoneNumber("+254701234567")
                .email("info@nairobiprimary.ac.ke")
                .principalName("John Kamau")
                .principalContact("+254712345678")
                .grades(Arrays.asList("Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"))
                .streams(Arrays.asList("A", "B", "C"))
                .totalStudents(450)
                .totalTeachers(25)
                .hasElectricity(true)
                .hasInternet(true)
                .hasComputerLab(true)
                .hasLibrary(true)
                .numberOfComputers(30)
                .active(true)
                .subscriptionTier("PREMIUM")
                .createdAt(LocalDateTime.now().toString())
                .build(),
                
            School.builder()
                .nemisCode("002002002")
                .name("Mombasa Secondary School")
                .type("SECONDARY")
                .category("PUBLIC")
                .county("Mombasa")
                .subCounty("Mvita")
                .ward("Tononoka")
                .location("Tononoka, Mombasa")
                .latitude(-4.0435)
                .longitude(39.6682)
                .phoneNumber("+254702345678")
                .email("info@mombasasecondary.ac.ke")
                .principalName("Mary Otieno")
                .principalContact("+254723456789")
                .grades(Arrays.asList("Form 1", "Form 2", "Form 3", "Form 4"))
                .streams(Arrays.asList("A", "B"))
                .totalStudents(320)
                .totalTeachers(20)
                .hasElectricity(true)
                .hasInternet(true)
                .hasComputerLab(true)
                .hasLibrary(true)
                .numberOfComputers(25)
                .active(true)
                .subscriptionTier("BASIC")
                .createdAt(LocalDateTime.now().toString())
                .build()
        );
        
        schoolRepository.saveAll(schools);
        log.info("Seeded {} schools", schools.size());
    }
}
