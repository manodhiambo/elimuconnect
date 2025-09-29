package ke.elimuconnect.utils;

public class Constants {
    
    // Admin
    public static final String ADMIN_CODE = "OnlyMe@2025";
    
    // JWT
    public static final long JWT_EXPIRATION_MS = 86400000; // 24 hours
    public static final long JWT_REFRESH_EXPIRATION_MS = 604800000; // 7 days
    
    // Kenyan Counties
    public static final String[] KENYAN_COUNTIES = {
        "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta",
        "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
        "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
        "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
        "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi",
        "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho",
        "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya",
        "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
    };
    
    // CBC Grades
    public static final String[] CBC_GRADES = {
        "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
        "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
    };
    
    // Subjects
    public static final String[] PRIMARY_SUBJECTS = {
        "Mathematics", "English", "Kiswahili", "Science and Technology",
        "Social Studies", "Creative Arts", "Physical Education"
    };
    
    public static final String[] SECONDARY_SUBJECTS = {
        "Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics",
        "History", "Geography", "CRE", "IRE", "HRE", "Business Studies",
        "Agriculture", "Computer Studies", "Home Science"
    };
}
