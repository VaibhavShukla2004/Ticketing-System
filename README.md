# 🎫 SupportDesk — Full-Stack Ticketing System

A production-ready IT support and customer service ticketing platform built with **Spring Boot** (Java), **PostgreSQL**, and **Next.js**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)

---

## 📁 Project Structure

```
Ticketing-System/
├── src/                              # Spring Boot backend
│   └── main/
│       ├── java/com/Ticketing/
│       │   ├── config/               # Security, AppConfig, DataInitializer
│       │   ├── controller/           # REST controllers
│       │   ├── dto/                  # Request/Response DTOs
│       │   ├── exception/            # Global exception handler
│       │   ├── model/                # JPA entities + enums
│       │   ├── repository/           # Spring Data JPA repositories
│       │   ├── security/             # JWT service & filter
│       │   └── service/              # Business logic services
│       └── resources/
│           └── application.properties
├── frontend/                         # Next.js frontend
│   ├── app/
│   │   ├── login/                    # Login & Register page
│   │   ├── dashboard/                # User dashboard
│   │   ├── tickets/
│   │   │   ├── page.tsx              # All tickets list
│   │   │   ├── my/page.tsx           # My tickets
│   │   │   ├── new/page.tsx          # Create ticket
│   │   │   └── [id]/page.tsx         # Ticket detail
│   │   └── admin/
│   │       ├── page.tsx              # Admin dashboard
│   │       └── users/page.tsx        # User management
│   ├── components/                   # Shared components
│   ├── lib/                          # API client, types, auth helpers
│   └── .env.local                    # Frontend env config
├── uploads/                          # File attachment storage (auto-created)
├── pom.xml                           # Maven project config
└── start.bat                         # Windows startup script
```

---

## ✅ Features Implemented

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Role-Based Access Control: **User**, **Support Agent**, **Admin**
- Register/Login with BCrypt password hashing
- Auto-redirect based on role on login

### 👤 User Dashboard
- View personal ticket statistics (Open / In Progress / Resolved / Closed)
- Create new tickets (subject, description, priority)
- View all own tickets with filtering & search
- Add comments to tickets
- View full ticket history with timestamps
- Upload and download file attachments
- Rate resolved tickets (1–5 stars + feedback)

### 🎫 Ticket Management
- Full lifecycle: **Open → In Progress → Resolved → Closed**
- Assign/reassign tickets to support agents
- Threaded comment system with author info & timestamps
- File attachment support (upload/download)
- Search by subject/description
- Filter by status, priority, assignee
- Paginated results with sorting

### 🛡️ Admin Panel
- System-wide statistics dashboard
- View and manage all tickets across all users
- Force reassign or change status of any ticket
- **User Management**: list, search, enable/disable, delete users
- **Role Management**: change any user's role (User / Support Agent / Admin)

### 🔒 Access Control
- Users can only access their own tickets
- Support Agents can view all tickets, change status, add comments
- Admins have full override capabilities
- Method-level security with `@PreAuthorize`
- RowLevel access validation in service layer

### 📧 Email Notifications (Optional)
- On ticket creation (to owner)
- On ticket assignment (to assignee)
- On status change (to owner)
- Async delivery (non-blocking)
- Enable by setting `app.mail.enabled=true` in `application.properties`

### 🔍 Search & Filter
- Full-text search on ticket subject/description
- Filter by status, priority, assignee
- Paginated results with configurable page size

### 📎 File Attachments
- Upload files to any ticket
- Secure UUID-based file storage
- Download with original filename
- Access-controlled (only owner, assignee, admin/agent)

### ⭐ Resolution Rating
- Users rate resolved/closed tickets (1–5 stars)
- Optional text feedback
- Displayed on ticket detail view

---

## 🚀 Quick Start (Windows)

### Prerequisites
| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17+ | [Adoptium](https://adoptium.net/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 13+ | [postgresql.org](https://www.postgresql.org/download/) |
| Maven | Bundled (`mvnw`) | — |

### 1. Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE ticketing_db;
-- The tables are auto-created by Hibernate on startup
```

### 2. Configure Backend

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ticketing_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 3. Start Everything

**Option A — One-Click Startup:**
```
Double-click start.bat
```

**Option B — Manual:**
```bash
# Terminal 1: Backend
./mvnw spring-boot:run

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |

### Default Credentials (auto-seeded)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Support Agent | `agent1` | `agent123` |
| User | `user1` | `user123` |

---

## 🔌 API Reference

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and get JWT |

### Ticket Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Create ticket |
| `GET` | `/api/tickets` | Get all tickets (agent/admin) |
| `GET` | `/api/tickets/my` | Get my tickets |
| `GET` | `/api/tickets/{id}` | Get ticket by ID |
| `PUT` | `/api/tickets/{id}` | Update ticket |
| `DELETE` | `/api/tickets/{id}` | Delete ticket |
| `POST` | `/api/tickets/{id}/comments` | Add comment |
| `POST` | `/api/tickets/{id}/rate` | Rate resolution |
| `POST` | `/api/tickets/{id}/attachments` | Upload file |
| `GET` | `/api/tickets/attachments/{file}` | Download file |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/users` | List all users |
| `PUT` | `/api/admin/users/{id}/role` | Change user role |
| `PUT` | `/api/admin/users/{id}/toggle` | Enable/disable user |
| `DELETE` | `/api/admin/users/{id}` | Delete user |

---

## ⚙️ Configuration

### Email Notifications
To enable email notifications, update `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password   # Use Gmail App Password
app.mail.enabled=true
```

### JWT Token
```properties
jwt.secret=your-256-bit-hex-secret
jwt.expiration=86400000   # 24 hours in milliseconds
```

### File Upload Limits
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload.dir=./uploads
```

---

## 🚢 Deployment Plan

### Option 1: Docker Compose (Recommended)

Create `docker-compose.yml` at the project root:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ticketing_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/ticketing_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      JWT_SECRET: your-production-secret
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080
    depends_on:
      - backend

volumes:
  pgdata:
  uploads:
```

**Dockerfile.backend:**
```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**Deploy:**
```bash
docker compose up --build -d
```

---

### Option 2: Cloud Deployment (AWS)

#### Backend → AWS Elastic Beanstalk or ECS Fargate
1. Package: `./mvnw package -DskipTests`
2. Upload JAR to Elastic Beanstalk, or build Docker image and push to ECR
3. Set environment variables via EB console or ECS task definition
4. Use **Amazon RDS** (PostgreSQL) as the managed database
5. Store uploads in **Amazon S3** (update FileStorageService to use AWS SDK)

#### Frontend → AWS Amplify or Vercel
1. Connect GitHub repository to Amplify/Vercel
2. Set `NEXT_PUBLIC_API_URL` to your backend's public URL
3. Auto-deploy on every push to `main`

#### Recommended AWS Architecture:
```
Users → CloudFront CDN → S3 (frontend static)
                       → ALB → ECS Fargate (backend)
                                           → RDS PostgreSQL
                                           → S3 Bucket (uploads)
```

---

### Option 3: Traditional VPS (Ubuntu)

```bash
# Install dependencies
sudo apt update && sudo apt install -y openjdk-17-jdk nodejs npm nginx postgresql

# Setup PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE ticketing_db;"
sudo -u postgres psql -c "CREATE USER ticketing WITH PASSWORD 'strongpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ticketing_db TO ticketing;"

# Build & run backend
./mvnw package -DskipTests
java -jar target/Ticketing-System-0.0.1-SNAPSHOT.jar \
  --spring.datasource.password=strongpassword \
  --jwt.secret=your-prod-secret &

# Build & run frontend
cd frontend && npm install && npm run build
npm start &

# Configure Nginx as reverse proxy
# /etc/nginx/sites-available/ticketing
server {
    listen 80;
    server_name yourdomain.com;
    location /api/ { proxy_pass http://localhost:8080; }
    location / { proxy_pass http://localhost:3000; }
}
```

---

### Production Security Checklist

- [ ] Change default credentials (admin/agent1/user1) immediately
- [ ] Use a strong 256-bit JWT secret
- [ ] Enable HTTPS with Let's Encrypt (Certbot)
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` in production
- [ ] Configure CORS to only allow your domain
- [ ] Enable and configure email notifications
- [ ] Move file storage to S3/cloud storage
- [ ] Set up database backups (pg_dump cron)
- [ ] Add rate limiting (Spring Cloud Gateway or Nginx)
- [ ] Enable Spring Boot Actuator with authentication for monitoring
- [ ] Set up log aggregation (e.g., ELK Stack or CloudWatch)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | Spring Boot 3.2.5 |
| Language | Java 17 |
| Security | Spring Security + JWT (JJWT) |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Validation | Bean Validation (Hibernate Validator) |
| Build Tool | Maven |
| Frontend Framework | Next.js 16 (App Router) |
| UI Language | TypeScript |
| Styling | Tailwind CSS v4 + Custom CSS |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Date Utils | date-fns |

---

## 📜 License

MIT License — feel free to use this for personal or commercial projects.
