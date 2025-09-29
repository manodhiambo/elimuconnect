package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.client.url}")
    private String clientUrl;
    
    @Async
    public void sendVerificationEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Welcome to ElimuConnect - Verify Your Account");
            message.setText(buildVerificationEmailBody(user));
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", user.getEmail(), e);
        }
    }
    
    @Async
    public void sendWelcomeEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Welcome to ElimuConnect!");
            message.setText(buildWelcomeEmailBody(user));
            
            mailSender.send(message);
            log.info("Welcome email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", user.getEmail(), e);
        }
    }
    
    @Async
    public void sendApprovalEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Your ElimuConnect Account Has Been Approved");
            message.setText(buildApprovalEmailBody(user));
            
            mailSender.send(message);
            log.info("Approval email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send approval email to: {}", user.getEmail(), e);
        }
    }
    
    private String buildVerificationEmailBody(User user) {
        return String.format("""
            Dear %s,
            
            Thank you for registering with ElimuConnect!
            
            Your account has been created successfully. Please wait for approval from the administrator.
            
            Role: %s
            Email: %s
            
            Once approved, you will receive another email and can start using ElimuConnect.
            
            Visit: %s
            
            Best regards,
            ElimuConnect Team
            """, user.getName(), user.getRole(), user.getEmail(), clientUrl);
    }
    
    private String buildWelcomeEmailBody(User user) {
        return String.format("""
            Dear %s,
            
            Welcome to ElimuConnect - Kenya's Premier Educational Platform!
            
            We're excited to have you join our community of learners and educators.
            
            Get started by logging in at: %s
            
            If you have any questions, feel free to reach out to our support team.
            
            Best regards,
            ElimuConnect Team
            """, user.getName(), clientUrl);
    }
    
    private String buildApprovalEmailBody(User user) {
        return String.format("""
            Dear %s,
            
            Great news! Your ElimuConnect account has been approved.
            
            You can now login and access all features at: %s
            
            Your Account Details:
            Email: %s
            Role: %s
            
            Best regards,
            ElimuConnect Team
            """, user.getName(), clientUrl, user.getEmail(), user.getRole());
    }
}
