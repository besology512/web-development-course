# Flight Booking System

A full-stack Flight Booking System built for SWAPD352 Web Development Spring-2026 assignment. Includes a custom Glassmorphism UI, JWT-based authentication, Mailtrap email verification, flight search, and booking management.

## Features
- **User Authentication**: Secure Registration & Login using `bcrypt` and `jsonwebtoken`.
- **Email Verification**: Integration with Mailtrap to send 6-digit verification code.
- **Flight Management**: Full CRUD for flights with MongoDB.
- **Flight Search**: Real-time filtering by `From`, `To`, and `Date`.
- **Booking System**: Securely book flights with available seat reduction updates. View booking history.
- **UI Design**: Modern, glassmorphism-inspired UI with custom Vanilla CSS.
- **Admin Roles**: Role separation for `admin` vs `user` functionalities.

## Tech Stack
- **Frontend**: React (Vite), React Router v6, Axios, Vanilla CSS.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Nodemailer (Mailtrap).

## Requirements to Run
- Node.js installed
- MongoDB instance (local or Atlas) running
- Mailtrap account credentials

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the Environment Variables by creating a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/flight-booking
   JWT_SECRET=your_jwt_secret_dev_assignment1
   MAILTRAP_USER=your_mailtrap_user
   MAILTRAP_PASS=your_mailtrap_pass
   ```
4. Start the backend Node server:
   ```bash
   npm run start
   # Or using node server.js directly
   node server.js
   ```

### 2. Frontend Setup
1. In another terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

### 3. Usage & Testing
1. Use the Register page to create an account.
2. Check your Mailtrap sandbox for the verification email.
3. Enter the code on the Verify Email page.
4. Login using your registered credentials.
5. Use the provided Postman collection JSON to create/manage flights as an admin (set a user's role to 'admin' manually in the database to test flight creation).
6. Search and Book flights!

## Postman Testing
Import `Flight_Booking.postman_collection.json` to Postman to view detailed testing for all endpoints and CRUD operations.
