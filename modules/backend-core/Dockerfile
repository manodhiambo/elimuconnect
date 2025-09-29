FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy parent POM and shared modules
COPY pom.xml .
COPY modules/shared-domain modules/shared-domain
COPY modules/shared-utils modules/shared-utils
COPY modules/backend-core modules/backend-core

# Build the application
RUN mvn clean package -DskipTests -pl modules/backend-core -am

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR
COPY --from=build /app/modules/backend-core/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
