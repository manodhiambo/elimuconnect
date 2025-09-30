FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy all pom files
COPY pom.xml .
COPY modules/shared-domain/pom.xml modules/shared-domain/
COPY modules/shared-utils/pom.xml modules/shared-utils/
COPY modules/backend-core/pom.xml modules/backend-core/

# Pre-download dependencies with retries and longer timeout
RUN mvn -T 4 dependency:resolve dependency:resolve-plugins -DskipTests -pl modules/backend-core -am || \
    sleep 5 && mvn -T 4 dependency:resolve dependency:resolve-plugins -DskipTests -pl modules/backend-core -am || \
    sleep 10 && mvn -T 4 dependency:resolve dependency:resolve-plugins -DskipTests -pl modules/backend-core -am || true

# Copy source
COPY modules/shared-domain modules/shared-domain
COPY modules/shared-utils modules/shared-utils
COPY modules/backend-core modules/backend-core

# Build with multiple retries
RUN mvn clean package -DskipTests -pl modules/backend-core -am -T 4 -Dmaven.artifact.threads=8 || \
    sleep 5 && mvn clean package -DskipTests -pl modules/backend-core -am -T 4 || \
    sleep 10 && mvn clean package -DskipTests -pl modules/backend-core -am

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/modules/backend-core/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
