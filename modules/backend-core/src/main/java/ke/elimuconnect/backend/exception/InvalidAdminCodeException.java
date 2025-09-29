package ke.elimuconnect.backend.exception;

public class InvalidAdminCodeException extends RuntimeException {
    public InvalidAdminCodeException(String message) {
        super(message);
    }
}
