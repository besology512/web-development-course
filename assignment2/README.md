# Assignment 2: Hybrid Ephemeral Messenger

A real-time messaging platform designed for extreme privacy using a hybrid architecture.

## Tech Stack
- **Frontend**: Next.js (App Router), Firebase Client SDK, Socket.io-client
- **Backend**: Express.js, Firebase Admin SDK, MongoDB (Mongoose), Redis
- **Styling**: Vanilla CSS (Styled-jsx)

## Setup Instructions

### 1. Infrastructure
Ensure you have Docker installed and run:
```bash
docker-compose up -d
```
This will start MongoDB and Redis.

### 2. Backend Setup
1. Navigate to `backend/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file (one has been provided with placeholders).
4. **Firebase**: Place your `firebase-service-account.json` in the `backend/` directory.
5. Start the server: `node server.js`.

### 3. Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Create a `.env.local` file with the following:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```
4. Start the dev server: `npm run dev`.

## Features
- **Verified Identity**: Login with Google via Firebase.
- **Ghost Chat**: Messages stored in Redis with a 2-minute TTL.
- **System Pulse Monitor**: Real-time log of backend events (auth, socket, redis expiry).
- **Minimalist Terminal UI**: Dual-pane layout for transparency.
