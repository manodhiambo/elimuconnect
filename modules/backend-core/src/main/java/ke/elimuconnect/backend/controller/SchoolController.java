package ke.elimuconnect.backend.controller;

import ke.elimuconnect.backend.entity.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/schools")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SchoolController {
    
    private final SchoolRepository schoolRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<School>>> getAllSchools(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<School> schools = schoolRepository.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(schools));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<School>> getSchool(@PathVariable String id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found"));
        return ResponseEntity.ok(ApiResponse.success(school));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<School>> createSchool(@RequestBody School school) {
        // Check if school code already exists
        if (schoolRepository.findByCode(school.getCode()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("School with this code already exists"));
        }
        
        school.setActive(true);
        school.setCreatedAt(LocalDateTime.now());
        school.setUpdatedAt(LocalDateTime.now());
        
        School saved = schoolRepository.save(school);
        return ResponseEntity.ok(ApiResponse.success(saved, "School created successfully"));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<School>> updateSchool(
            @PathVariable String id,
            @RequestBody School schoolUpdate) {
        
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found"));
        
        school.setName(schoolUpdate.getName());
        school.setAddress(schoolUpdate.getAddress());
        school.setCounty(schoolUpdate.getCounty());
        school.setPrincipal(schoolUpdate.getPrincipal());
        school.setPhoneNumber(schoolUpdate.getPhoneNumber());
        school.setEmail(schoolUpdate.getEmail());
        school.setUpdatedAt(LocalDateTime.now());
        
        School updated = schoolRepository.save(school);
        return ResponseEntity.ok(ApiResponse.success(updated, "School updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchool(@PathVariable String id) {
        schoolRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "School deleted successfully"));
    }
}
