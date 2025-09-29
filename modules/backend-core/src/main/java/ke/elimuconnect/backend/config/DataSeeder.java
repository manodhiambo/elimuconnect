package ke.elimuconnect.backend.config;

import ke.elimuconnect.domain.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(SchoolRepository schoolRepository) {
        return args -> {
            if (schoolRepository.count() == 0) {
                log.info("Seeding initial school data...");
                
                List<School> schools = new ArrayList<>();
                
                // Kilifi County Schools
                schools.add(createSchool("Malindi High School", "Malindi, Kilifi County", "PUBLIC"));
                schools.add(createSchool("Gede Secondary School", "Gede, Kilifi County", "PUBLIC"));
                schools.add(createSchool("Kilifi Township Primary School", "Kilifi Town, Kilifi County", "PUBLIC"));
                schools.add(createSchool("Watamu Primary School", "Watamu, Kilifi County", "PUBLIC"));
                
                // Nairobi Schools
                schools.add(createSchool("Alliance High School", "Kikuyu, Kiambu County", "PUBLIC"));
                schools.add(createSchool("Starehe Boys Centre", "Nairobi", "PUBLIC"));
                schools.add(createSchool("Kenya High School", "Nairobi", "PUBLIC"));
                schools.add(createSchool("Loreto Convent Valley Road", "Nairobi", "PRIVATE"));
                schools.add(createSchool("Nairobi School", "Nairobi", "PUBLIC"));
                schools.add(createSchool("Strathmore School", "Nairobi", "PRIVATE"));
                schools.add(createSchool("St. Mary's School", "Nairobi", "PRIVATE"));
                schools.add(createSchool("Braeburn School", "Nairobi", "PRIVATE"));
                
                // Mombasa Schools
                schools.add(createSchool("Aga Khan Academy Mombasa", "Mombasa", "PRIVATE"));
                schools.add(createSchool("Mombasa High School", "Mombasa", "PUBLIC"));
                schools.add(createSchool("Serani Secondary School", "Mombasa", "PUBLIC"));
                schools.add(createSchool("Coast Academy", "Mombasa", "PRIVATE"));
                
                // Kisumu Schools
                schools.add(createSchool("Kisumu Boys High School", "Kisumu", "PUBLIC"));
                schools.add(createSchool("Kisumu Girls High School", "Kisumu", "PUBLIC"));
                schools.add(createSchool("St. Mary's School Yala", "Yala, Siaya County", "PRIVATE"));
                
                // Central Kenya Schools
                schools.add(createSchool("Alliance Girls High School", "Kikuyu, Kiambu County", "PUBLIC"));
                schools.add(createSchool("Mang'u High School", "Thika, Kiambu County", "PUBLIC"));
                schools.add(createSchool("Loreto High School Limuru", "Limuru, Kiambu County", "PRIVATE"));
                schools.add(createSchool("Kagumo High School", "Nyeri", "PUBLIC"));
                schools.add(createSchool("Tumutumu Girls High School", "Nyeri", "PUBLIC"));
                
                // Rift Valley Schools
                schools.add(createSchool("Moi High School Kabarak", "Nakuru", "PUBLIC"));
                schools.add(createSchool("Menengai High School", "Nakuru", "PUBLIC"));
                schools.add(createSchool("Brookhouse School", "Nakuru", "PRIVATE"));
                schools.add(createSchool("Hill School Eldoret", "Eldoret", "PRIVATE"));
                schools.add(createSchool("Moi Girls School Eldoret", "Eldoret", "PUBLIC"));
                
                // Western Kenya Schools
                schools.add(createSchool("Friends School Kamusinga", "Bungoma", "PUBLIC"));
                schools.add(createSchool("Kakamega High School", "Kakamega", "PUBLIC"));
                schools.add(createSchool("Butere Girls High School", "Butere, Kakamega County", "PUBLIC"));
                
                // Eastern Kenya Schools
                schools.add(createSchool("Meru School", "Meru", "PUBLIC"));
                schools.add(createSchool("Chuka Boys High School", "Chuka, Tharaka Nithi County", "PUBLIC"));
                schools.add(createSchool("Machakos School", "Machakos", "PUBLIC"));
                
                schoolRepository.saveAll(schools);
                log.info("Seeded {} schools successfully", schools.size());
            } else {
                log.info("Database already contains {} schools, skipping seeding", schoolRepository.count());
            }
        };
    }
    
    private School createSchool(String name, String location, String type) {
        School school = new School();
        school.setName(name);
        school.setLocation(location);
        school.setType(type);
        return school;
    }
}
