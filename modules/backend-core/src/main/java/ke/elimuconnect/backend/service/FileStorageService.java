package ke.elimuconnect.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {
    
    @Value("${app.upload.dir:${user.home}/elimuconnect-uploads}")
    private String uploadDir;
    
    public String uploadFile(MultipartFile file, String category) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, category);
            Files.createDirectories(uploadPath);
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String filename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL (in production, this would be a CDN URL or S3 URL)
            String fileUrl = "/uploads/" + category + "/" + filename;
            
            log.info("File uploaded successfully: {}", fileUrl);
            return fileUrl;
            
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
    
    public void deleteFile(String fileUrl) {
        try {
            // Extract filename from URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            String category = fileUrl.split("/")[2]; // Extract category from URL
            
            Path filePath = Paths.get(uploadDir, category, filename);
            Files.deleteIfExists(filePath);
            
            log.info("File deleted successfully: {}", fileUrl);
        } catch (IOException e) {
            log.error("Failed to delete file", e);
        }
    }
}
