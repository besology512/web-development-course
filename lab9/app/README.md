# Lab 5: Testing & API Documentation (Postman & Swagger)

## Overview
This lab focuses on professionalizing the backend service by implementing automated testing with Postman and interactive API documentation with Swagger.

## Goals
1. **Postman Environment Switching**: Seamlessly toggle between local and production API base URLs.
2. **Automated Testing**: Implement test scripts for status codes, performance, and response structure.
3. **API Documentation**: Use Swagger (OpenAPI 3.0) to document endpoints and data models.
4. **Swagger UI Integration**: Serve interactive documentation directly from the Express app.

## Setup & Running
1. **Native (Local MongoDB)**:
   - Ensure MongoDB is running on `27017`.
   - `npm install`
   - `npm start`
   - Access Swagger UI: `http://localhost:5000/api-docs`
2. **Docker**:
   - `docker-compose up -d`
   - Access Swagger UI: `http://localhost:5002/api-docs`

## Postman Collection
The `postman/` directory contains:
- `ClipSphere-Collection.postman_collection.json`: Import this into Postman.
- `ClipSphere-Dev.postman_environment.json`: Dev environment with `base_url`.
- `ClipSphere-Prod.postman_environment.json`: Prod environment placeholder.

Run the collection using the **Postman Collection Runner** to verify all tests pass.

## Documentation
The API is documented in `swagger.yaml` and served via `swagger-ui-express` at `/api-docs`.
