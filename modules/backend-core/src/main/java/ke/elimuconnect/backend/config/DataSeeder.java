package ke.elimuconnect.backend.config;

import ke.elimuconnect.domain.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    
    private final SchoolRepository schoolRepository;

    @Override
    public void run(String... args) {
        if (schoolRepository.count() == 0) {
            log.info("Seeding initial school data...");
            
            List<School> schools = new ArrayList<>();
            
            // Nairobi County Schools
            schools.add(createSchool("Alliance High School", "Nairobi", "Westlands", "PUBLIC", "SECONDARY", 
                "Principal John Kamau", "alliance@schools.ke", "+254712345601", 800));
            schools.add(createSchool("Kenya High School", "Nairobi", "Nairobi Central", "PUBLIC", "SECONDARY",
                "Principal Mary Wanjiru", "kenyahigh@schools.ke", "+254712345602", 750));
            
            // Mombasa County Schools
            schools.add(createSchool("Mombasa Academy", "Mombasa", "Mvita", "PRIVATE", "SECONDARY",
                "Principal Ahmed Hassan", "mombasa.academy@schools.ke", "+254712345603", 600));
            schools.add(createSchool("Coast Secondary School", "Mombasa", "Kisauni", "PUBLIC", "SECONDARY",
                "Principal Grace Muthoni", "coast.secondary@schools.ke", "+254712345604", 850));
            
            // Add more schools (shortened for brevity)
            schools.add(createSchool("Nakuru High School", "Nakuru", "Nakuru East", "PUBLIC", "SECONDARY",
                "Principal Peter Njoroge", "nakuru.high@schools.ke", "+254712345605", 900));
            
            schoolRepository.saveAll(schools);
            log.info("Successfully seeded {} schools", schools.size());
        } else {
            log.info("School data already exists, skipping seeding");
        }
    }

    private School createSchool(String name, String county, String subCounty, String type, 
                               String level, String principal, String email, String phone, Integer studentCount) {
        return School.builder()
                .name(name)
                .county(county)
                .subCounty(subCounty)
                .type(type)
                .level(level)
                .principal(principal)
                .email(email)
                .phone(phone)
                .studentCount(studentCount)
                .build();
    }
}
