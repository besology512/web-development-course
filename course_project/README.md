# ClipSphere: Short-Form Video Platform

ClipSphere is a premium short-video social platform built with a microservices architecture. This repository contains the full stack, including frontend, backend, background workers, and infrastructure.

## 🚀 Current Status: Phase 4 Complete

We have finalized Phase 4, focusing on full containerization, orchestration, and local infrastructure stability.

### Key Features (Phase 4)
- **Full Dockerization:** All services (Frontend, Backend, Worker, DB, Storage, Redis, Nginx) run in isolated containers.
- **Nginx Reverse Proxy:** Secure HTTPS gateway at `https://localhost` with self-signed certificates.
- **Background Workers:** BullMQ integrated for asynchronous video processing (duration extraction) and email notifications.
- **Optimized Builds:** Multi-stage Docker builds and `.dockerignore` files for fast deployments.
- **Stress Tested:** Verified with concurrent bulk video uploads.

## 🛠️ Infrastructure Stack
- **Frontend:** Next.js (Standalone build)
- **Backend:** Express.js (REST API)
- **Worker:** Node.js (BullMQ background processing)
- **Database:** MongoDB
- **Caching:** Redis
- **Storage:** MinIO (S3 Compatible)
- **Gateway:** Nginx (Reverse Proxy + SSL)

## 📖 Bonus Phase: Points-per-Action Scoring
We are currently implementing a real-time "Trending Score" mechanism to prioritize high-engagement content.

### Scoring Formula
`Total_Score = (Likes x 10) + (Avg_Rating x 2) + Freshness_Bonus`

### Implementation Plan
1. **Update Video Schema:** Add `trendingScore` field.
2. **Real-time Updates:**
   - Increment score by 10 on each Like.
   - Update score when a Review is added.
3. **Enhanced "For You" Feed:**
   - Prioritize creators followed by the user.
   - Sort remaining content by `trendingScore`.

---

## ⚡ Quick Start

### 1. Requirements
- Docker & Docker Compose
- Node.js (for local scripts)

### 2. Start the Ecosystem
```powershell
cd "course_project"
docker-compose up -d --build
```

### 3. Verification
- **API Health:** `https://localhost/api/v1/health`
- **Stress Test:** `node stress_test.js`
- **Frontend:** `https://localhost`

---

## 📝 Documentation
For detailed phase-specific documentation, see:
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- [PHASE3_SETUP.md](PHASE3_SETUP.md)
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
