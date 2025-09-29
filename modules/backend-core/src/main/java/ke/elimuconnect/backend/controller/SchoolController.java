package ke.elimuconnect.backend.controller;

import ke.elimuconnect.domain.School;
import ke.elimuconnect.backend.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SchoolController {
    
    private final SchoolService schoolService;
    
    @GetMapping
    public ResponseEntity<List<School>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<School>> searchSchools(@RequestParam String query) {
        return ResponseEntity.ok(schoolService.searchSchools(query));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<School> getSchoolById(@PathVariable String id) {
        return schoolService.getSchoolById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
