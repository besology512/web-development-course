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

### Option 1: Docker (Recommended)
This project is fully containerized. To run the frontend, backend, and MongoDB simultaneously without any local dependencies:
1. Ensure Docker Desktop is running.
2. Open a terminal in the assignment directory and run:
   ```bash
   docker-compose up -d --build
   ```
3. Wait a moment for the containers to compile. The web app will be accessible at `http://localhost:5173` and the API at `http://localhost:5000`.
4. (Optional) Inject demo flights and users into the database by running:
   ```bash
   docker-compose exec backend node seeder.js
   ```

### Option 2: Manual Setup (Local Node + MongoDB)
#### Backend Setup
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
   ```

#### Frontend Setup
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

## Usage & Testing
1. **Testing Accounts**: If you ran the `seeder.js` script, you can log in immediately using:
    - Admin: `admin@aerobooking.com` / `admin123`
    - Student: `student@test.com` / `password123`
2. **Registration Flow**: Use the Register page to create a new account.
3. **Verification**: Check your Mailtrap sandbox for the verification email. Enter the 6-digit code on the Verify Email page.
4. **Flight Search**: Log in to search and book flights!
5. **Postman**: Import `Flight_Booking.postman_collection.json` to Postman to view detailed testing for all endpoints.

## Postman Testing
Import `Flight_Booking.postman_collection.json` to Postman to view detailed testing for all endpoints and CRUD operations.
