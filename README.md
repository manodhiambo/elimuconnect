# ElimuConnect - Educational Platform for Kenya

A comprehensive educational platform built with Spring Boot (Java) backend and React (TypeScript) frontend.

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.9+
- MongoDB (Atlas or local)
- Git

## Project Structure

elimuconnect/
├── modules/
│   ├── shared-domain/        # Shared domain models
│   ├── shared-utils/          # Common utilities
│   ├── backend-core/          # Spring Boot backend
│   └── web-frontend/          # React frontend
├── infrastructure/            # Docker, Kubernetes configs
├── tools/                     # Scripts and utilities
└── docs/                      # Documentation

## Getting Started

### 1. Clone the Repository

git clone <repository-url>
cd elimuconnect

### 2. Build Backend

# Build all modules
mvn clean install

# Or build individually
cd modules/backend-core
mvn clean install

### 3. Configure Backend
Create modules/backend-core/src/main/resources/application-dev.yml:
spring:
  data:
    mongodb:
      uri: mongodb+srv://your-connection-string
  mail:
    host: smtp.gmail.com
    username: your-email@gmail.com
    password: your-app-password

app:
  jwt:
    secret: your-secret-key
  client:
    url: http://localhost:3000


### 4. Run Backend
cd modules/backend-core
mvn spring-boot:run -Dspring-boot.run.profiles=dev

Backend will start on http://localhost:8080

### 5. Setup Frontend

cd modules/web-frontend
npm install

Create .env.development:
VITE_API_URL=http://localhost:8080/api/v1

### 6. Run Frontend

npm run dev
Frontend will start on http://localhost:3000


