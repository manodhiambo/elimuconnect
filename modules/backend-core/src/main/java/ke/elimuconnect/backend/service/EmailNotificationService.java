package ke.elimuconnect.backend.service;

import ke.elimuconnect.backend.entity.User;
import ke.elimuconnect.domain.Content;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.admin.email:manodhiambo@gmail.com}")
    private String adminEmail;
    
    @Value("${app.admin.phone:0703445756}")
    private String adminPhone;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Async
    public void sendUserRegistrationNotification(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("New User Registration - ElimuConnect");
            
            String htmlContent = buildUserRegistrationEmail(user);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Registration notification sent to admin for user: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send registration notification email", e);
        }
    }
    
    @Async
    public void sendUserApprovalEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Registration Approved - ElimuConnect");
            
            String htmlContent = buildUserApprovalEmail(user);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Approval email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send approval email", e);
        }
    }
    
    @Async
    public void sendUserRejectionEmail(User user, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Registration Update - ElimuConnect");
            
            String htmlContent = buildUserRejectionEmail(user, reason);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Rejection email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send rejection email", e);
        }
    }
    
    @Async
    public void sendContentUploadNotification(Content content, User uploader) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("New Content Upload - ElimuConnect");
            
            String htmlContent = buildContentUploadEmail(content, uploader);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Content upload notification sent to admin");
        } catch (MessagingException e) {
            log.error("Failed to send content upload notification", e);
        }
    }
    
    @Async
    public void sendContentApprovalEmail(Content content, String uploaderEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(uploaderEmail);
            helper.setSubject("Content Approved - ElimuConnect");
            
            String htmlContent = buildContentApprovalEmail(content);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Content approval email sent");
        } catch (MessagingException e) {
            log.error("Failed to send content approval email", e);
        }
    }
    
    @Async
    public void sendContentRejectionEmail(Content content, String uploaderEmail, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(uploaderEmail);
            helper.setSubject("Content Review Update - ElimuConnect");
            
            String htmlContent = buildContentRejectionEmail(content, reason);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Content rejection email sent");
        } catch (MessagingException e) {
            log.error("Failed to send content rejection email", e);
        }
    }
    
    private String buildUserRegistrationEmail(User user) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0284c7; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .detail { margin: 10px 0; padding: 10px; background-color: white; border-left: 4px solid #0284c7; }
                    .detail strong { color: #0284c7; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New User Registration</h1>
                    </div>
                    <div class="content">
                        <p>A new user has registered on ElimuConnect and requires approval.</p>
                        
                        <div class="detail">
                            <strong>Name:</strong> %s
                        </div>
                        <div class="detail">
                            <strong>Email:</strong> %s
                        </div>
                        <div class="detail">
                            <strong>Role:</strong> %s
                        </div>
                        <div class="detail">
                            <strong>Phone:</strong> %s
                        </div>
                        
                        %s
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <p>Please review and approve/reject this registration through the admin dashboard.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>Support Contact:</strong></p>
                        <p>Email: %s | Phone: %s</p>
                        <p>&copy; 2025 ElimuConnect. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            user.getName(),
            user.getEmail(),
            user.getRole().toString().replace("ROLE_", ""),
            user.getPhoneNumber() != null ? user.getPhoneNumber() : "Not provided",
            buildRoleSpecificDetails(user),
            adminEmail,
            adminPhone
        );
    }
    
    private String buildRoleSpecificDetails(User user) {
        StringBuilder details = new StringBuilder();
        
        switch (user.getRole()) {
            case TEACHER:
                details.append(String.format("<div class='detail'><strong>TSC Number:</strong> %s</div>", 
                    user.getTscNumber()));
                details.append(String.format("<div class='detail'><strong>School ID:</strong> %s</div>", 
                    user.getSchoolId()));
                details.append(String.format("<div class='detail'><strong>Qualification:</strong> %s</div>", 
                    user.getQualification()));
                break;
            case STUDENT:
                details.append(String.format("<div class='detail'><strong>Admission Number:</strong> %s</div>", 
                    user.getAdmissionNumber()));
                details.append(String.format("<div class='detail'><strong>School ID:</strong> %s</div>", 
                    user.getSchoolId()));
                details.append(String.format("<div class='detail'><strong>Class:</strong> %s</div>", 
                    user.getClassName()));
                break;
            case PARENT:
                details.append(String.format("<div class='detail'><strong>National ID:</strong> %s</div>", 
                    user.getNationalId()));
                details.append(String.format("<div class='detail'><strong>Children Admission Numbers:</strong> %s</div>", 
                    String.join(", ", user.getChildrenAdmissionNumbers())));
                break;
        }
        
        return details.toString();
    }
    
    private String buildUserApprovalEmail(User user) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Registration Approved!</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Congratulations! Your registration on ElimuConnect has been approved.</p>
                        <p>You can now log in and access all features available to your role.</p>
                        <p><strong>Your Role:</strong> %s</p>
                        <p>Welcome to the ElimuConnect community!</p>
                    </div>
                    <div class="footer">
                        <p>Need help? Contact us at %s or call %s</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            user.getName(),
            user.getRole().toString().replace("ROLE_", ""),
            adminEmail,
            adminPhone
        );
    }
    
    private String buildUserRejectionEmail(User user, String reason) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .reason { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Registration Update</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Thank you for your interest in ElimuConnect. Unfortunately, we are unable to approve your registration at this time.</p>
                        <div class="reason">
                            <strong>Reason:</strong><br>%s
                        </div>
                        <p>If you believe this is an error or have questions, please contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>Contact us at %s or call %s</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            user.getName(),
            reason,
            adminEmail,
            adminPhone
        );
    }
    
    private String buildContentUploadEmail(Content content, User uploader) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .detail { margin: 10px 0; padding: 10px; background-color: white; border-left: 4px solid #7c3aed; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Content Upload</h1>
                    </div>
                    <div class="content">
                        <p>New content has been uploaded and requires review.</p>
                        
                        <div class="detail">
                            <strong>Title:</strong> %s
                        </div>
                        <div class="detail">
                            <strong>Subject:</strong> %s
                        </div>
                        <div class="detail">
                            <strong>Grade:</strong> %s
                        </div>
                        <div class="detail">
                            <strong>Content Type:</strong> %s
                        </div>
                        <div class="detail">
                            <strong>Uploaded By:</strong> %s (%s)
                        </div>
                        
                        <p style="text-align: center; margin-top: 20px;">
                            Please review this content through the admin dashboard.
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 ElimuConnect. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            content.getTitle(),
            content.getSubject(),
            content.getGrade(),
            content.getContentType(),
            uploader.getName(),
            uploader.getEmail()
        );
    }
    
    private String buildContentApprovalEmail(Content content) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Content Approved!</h1>
                    </div>
                    <div class="content">
                        <p>Your content has been approved and is now available on ElimuConnect.</p>
                        <p><strong>Title:</strong> %s</p>
                        <p>Thank you for contributing to our educational platform!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 ElimuConnect. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            content.getTitle()
        );
    }
    
    private String buildContentRejectionEmail(Content content, String reason) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .reason { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Content Review Update</h1>
                    </div>
                    <div class="content">
                        <p>Your content submission has been reviewed.</p>
                        <p><strong>Title:</strong> %s</p>
                        <div class="reason">
                            <strong>Feedback:</strong><br>%s
                        </div>
                        <p>Please review the feedback and feel free to submit again.</p>
                    </div>
                    <div class="footer">
                        <p>Contact us at %s for assistance</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            content.getTitle(),
            reason,
            adminEmail
        );
    }
}
