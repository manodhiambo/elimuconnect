package ke.elimuconnect.utils;

import java.util.regex.Pattern;

public class ValidationUtil {
    
    private static final Pattern KENYAN_PHONE_PATTERN = Pattern.compile("^\\+254[0-9]{9}$");
    private static final Pattern NATIONAL_ID_PATTERN = Pattern.compile("^[0-9]{7,8}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    public static boolean isValidKenyanPhone(String phone) {
        return phone != null && KENYAN_PHONE_PATTERN.matcher(phone).matches();
    }
    
    public static boolean isValidNationalId(String nationalId) {
        return nationalId != null && NATIONAL_ID_PATTERN.matcher(nationalId).matches();
    }
    
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    public static String normalizePhone(String phone) {
        if (phone == null) return null;
        
        // Remove spaces and dashes
        phone = phone.replaceAll("[\\s-]", "");
        
        // Convert 07XX to +2547XX
        if (phone.startsWith("07") || phone.startsWith("01")) {
            phone = "+254" + phone.substring(1);
        }
        
        // Convert 7XX to +2547XX
        if (phone.matches("^[0-9]{9}$")) {
            phone = "+254" + phone;
        }
        
        return phone;
    }
}
