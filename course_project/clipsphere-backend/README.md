# ClipSphere Backend - Phase 1

This is the backend for **ClipSphere**, a robust video sharing platform. This phase focuses on core infrastructure, authentication, security, and containerization.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)

### Deployment with Docker
To get the entire stack (API + MongoDB) running:
```powershell
docker-compose up --build -d
```

### Verification
A PowerShell script is provided to quickly verify the API health and core functionality:
```powershell
.\test-api.ps1
```
*The script will automatically start the Docker cluster if it isn't already running.*

## 🧪 Testing

### Integration Tests
Comprehensive tests covering Auth, Users, Videos, and Admin are available in the `tests/` directory.

To run tests inside the container:
```powershell
docker exec -it clipsphere_app npm test -- --runInBand --watchAll=false
```

## 🛠️ Tech Stack & Features
- **Core:** Node.js, Express
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Zod
- **Security:** JWT, Bcrypt, Helmet, CORS, NoSQL Injection Prevention
- **Testing:** Jest, Supertest
- **Infrastructure:** Docker (Multi-stage build)

## 📁 Key Endpoints
- `POST /api/v1/auth/register` - User Registration
- `POST /api/v1/auth/login` - User Login
- `GET /api/v1/users/me` - Current User Profile (Protected)
- `POST /api/v1/videos` - Create Video Metadata (Protected)
- `GET /api/v1/videos` - List Public Videos
- `GET /health` - System Health Check

## 🔧 Critical Fixes Implemented
- **Express 5 Migration:** Reverted to Express 4.x for stable middleware compatibility (`express-mongo-sanitize`).
- **Route Specificity:** Fixed static route shadowing (e.g., `/me` vs `/:id`) in the router.
- **Model Hooks:** Resolved `TypeError` in `async` pre-save password hashing.
- **Persistence:** Configured Mongoose to preserve notification defaults in the database.

---
*Developed as part of the SWAPD352 Web Development Course deliverables.*
