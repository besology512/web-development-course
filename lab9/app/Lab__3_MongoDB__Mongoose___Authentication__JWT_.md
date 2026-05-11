SWAPD352 - Web Development Lab #3: MongoDB, Mongoose & Authentication (JWT)

Part 1: Connecting MongoDB & Mongoose

1. Install the required dependencies: npm install mongoose bcryptjs jsonwebtoken
1. Update the project structure as follows:

   lab3-auth-db

app.js server.js config.env models/ controllers/ routes/ middleware/

3. Connect the application to MongoDB inside server.js using environment variables.
3. Create a config.env file containing:

   PORT=5000 DATABASE=mongodb://127.0.0.1:27017/lab3db JWT\_SECRET=mySuperSecretKey JWT\_EXPIRES\_IN=1d

Part 2: Creating User Model

1. Create models/userModel.js.
1. Define the following fields:
- name (required)
- email (required, unique)
- password (required, minimum length 6, not selected by default)
- role (enum: user, admin — default user)
3. Implement a pre-save hook to hash the password before saving.
3. Export the User model.

Part 3: Authentication Controller

1. Create controllers/authController.js.
1. Implement:
- Signup Endpoint
- Create new user
- Generate JWT
- Send token in response
- Login Endpoint
- Check email and password
- Compare hashed password
- Generate JWT
- Return token

Part 4: Protecting Routes (JWT Middleware)

1. Create middleware/protect.js.
1. Extract token from Authorization header (Bearer token).
1. Verify JWT.
1. Check if user still exists.
1. Attach user to request object.
1. Protect the route:

   GET /me

Part 5: Role-Based Access Control (RBAC)

1. Create middleware/restrictTo.js.
1. Allow access only to specified roles.
1. Protect route:

   DELETE /users/:id

   (Admin only)

Part 6: Mini Challenge – Upgrade Video API

1. Replace in-memory array with MongoDB.
1. Create Video schema: {

title: String,

description: String, createdAt: Date,

user: ObjectId (ref to User)

}

3. Implement:
- GET /videos (public)
- POST /videos (protected)
- Only owner can delete their video
- Admin can delete any video

Submission Requirements

- Project folder
- Postman collection
- Screenshots:
- MongoDB running
- Successful signup
- Successful login
- Accessing protected route
- README file explaining:
- Authentication vs Authorization
- Why password is hashed
- Meaning of stateless
- What is RBAC
3
