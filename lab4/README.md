# Lab 3: MongoDB, Mongoose & Authentication (JWT)

## Overview
This project implements a secure backend with Node.js, Express, and MongoDB. It features JWT-based authentication, password hashing with BCrypt, and Role-Based Access Control (RBAC).

## Setup
1. Ensure MongoDB is running on `mongodb://127.0.0.1:27017/lab3db`.
2. Install dependencies: `npm install`.
3. Start the server: `npm start` (or `node server.js`).

## Key Concepts
### Authentication vs Authorization
- **Authentication**: Verifying who a user is (e.g., login with email/password). "Who are you?"
- **Authorization**: Verifying what a user is allowed to do (e.g., only admins can delete users). "What can you do?"

### Why Hashing Passwords?
Passwords are hashed using `bcryptjs` before storage to ensure that even if the database is compromised, the actual passwords are not exposed. Hashing is a one-way process; it cannot be reversed.

### Statelessness
This API is stateless, meaning each request contains all the information necessary to handle it (via the JWT). The server does not store session data for clients.

### Role-Based Access Control (RBAC)
RBAC is a method of restricting system access to authorized users based on their roles (e.g., `user`, `admin`). This project uses middleware to enforce these restrictions.

## Mini Challenge: Video API
- `GET /api/videos`: Public.
- `POST /api/videos`: Protected (logged-in users only).
- `DELETE /api/videos/:id`: Protected. Only the video owner or an admin can delete a video.
