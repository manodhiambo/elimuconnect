package ke.elimuconnect.backend.controller;

import ke.elimuconnect.domain.School;
import ke.elimuconnect.backend.repository.SchoolRepository;
import ke.elimuconnect.domain.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
public class SchoolController {
    
    private final SchoolRepository schoolRepository;
    
    // Public endpoint - no authentication required
    @GetMapping
    public ResponseEntity<ApiResponse<Page<School>>> getAllSchools(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "100") int size) {
        Page<School> schools = schoolRepository.findByActiveTrue(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(schools));
    }
    
    // Public endpoint - no authentication required  
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<School>>> searchSchools(
            @RequestParam(name = "query", required = false, defaultValue = "") String query) {
        List<School> schools;
        if (query.isEmpty()) {
            schools = schoolRepository.findByActiveTrue();
        } else {
            schools = schoolRepository.findByNameContainingIgnoreCaseAndActiveTrue(query);
        }
        return ResponseEntity.ok(ApiResponse.success(schools));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<School>> getSchool(@PathVariable(name = "id") String id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found"));
        return ResponseEntity.ok(ApiResponse.success(school));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<School>> createSchool(@RequestBody School school) {
        if (school.getNemisCode() != null &&
            schoolRepository.findByNemisCode(school.getNemisCode()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("School with this NEMIS code already exists"));
        }
        school.setActive(true);
        school.setCreatedAt(LocalDateTime.now().toString());
        school.setUpdatedAt(LocalDateTime.now().toString());
        School saved = schoolRepository.save(school);
        return ResponseEntity.ok(ApiResponse.success(saved, "School created successfully"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<School>> updateSchool(
            @PathVariable(name = "id") String id,
            @RequestBody School schoolUpdate) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found"));
        
        school.setName(schoolUpdate.getName());
        school.setCounty(schoolUpdate.getCounty());
        school.setSubCounty(schoolUpdate.getSubCounty());
        school.setPhoneNumber(schoolUpdate.getPhoneNumber());
        school.setEmail(schoolUpdate.getEmail());
        school.setPrincipalName(schoolUpdate.getPrincipalName());
        school.setPrincipalContact(schoolUpdate.getPrincipalContact());
        school.setUpdatedAt(LocalDateTime.now().toString());
        
        School updated = schoolRepository.save(school);
        return ResponseEntity.ok(ApiResponse.success(updated, "School updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSchool(@PathVariable(name = "id") String id) {
        schoolRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "School deleted successfully"));
    }
}
