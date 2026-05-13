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
docker compose up -d
```
This will start MongoDB and Redis.

### 2. Backend Setup
1. Navigate to `backend/`.
2. Install dependencies: `npm install`.
3. Configure `.env`:
   - `MOCK_TWILIO=true` (Recommended for testing without SMS charges/restrictions)
   - Add your Twilio SID/Token if testing live.
4. **Firebase**: Place your `firebase-service-account.json` in the `backend/` directory.
5. Start the server: `npm run dev`.

### 3. Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Configure `.env.local` with your Firebase Client keys.
4. Start the dev server: `npm run dev`.

## Features & Bonuses

### Core Features
- **Verified Identity**: Login with Google via Firebase.
- **Ghost Chat**: Messages stored in Redis with a configurable TTL.
- **System Pulse Monitor**: Real-time log of backend events (auth, socket, redis expiry).
- **Minimalist Terminal UI**: Dual-pane layout for transparency.

### Bonus Features Implementation
- **MFA via Twilio**: 2-step verification (Google + SMS OTP).
- **Frontend Encryption**: AES-256 encryption on all message payloads.
- **Atomic Read-Once**: Redis MULTI/EXEC logic ensures history is wiped immediately after one read.
- **Burn-on-Disconnect**: Instant presence purging and broadcast on tab close.

## Testing Bonuses
- **MFA**: Check the backend terminal console for the 6-digit code when `MOCK_TWILIO=true`.
- **Read-Once**: Send a message, refresh the page, and observe that the history is gone.
- **Encryption**: Use `redis-cli` to view `chat:room` keys; the content will be encrypted ciphertext.
