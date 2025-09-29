package ke.elimuconnect.domain.user;

public enum UserRole {
    ADMIN("ROLE_ADMIN"),
    TEACHER("ROLE_TEACHER"),
    STUDENT("ROLE_STUDENT"),
    PARENT("ROLE_PARENT");
    
    private final String authority;
    
    UserRole(String authority) {
        this.authority = authority;
    }
    
    public String getAuthority() {
        return authority;
    }
}
