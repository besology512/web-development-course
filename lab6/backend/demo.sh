#!/bin/bash

# Lab 3 API Automated Demo Script
# Requires: curl, grep, sed

API_URL="http://localhost:5000/api"

echo "------------------------------------------------"
echo "Starting Lab 3 API Automated Walkthrough"
echo "------------------------------------------------"

# 1. Public Access
echo -e "\n1. Testing Public Access: GET /videos"
curl -s -X GET "$API_URL/videos" | grep -o '"results":[0-9]*'

# 2. Unauthorized Access
echo -e "\n2. Testing Unauthorized Access: GET /users/me (Expected to fail)"
curl -s -X GET "$API_URL/users/me"

# 3. Signup Alice (User)
echo -e "\n3. Signing up Alice (role: user)..."
ALICE_RESP=$(curl -s -X POST "$API_URL/users/signup" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "password": "password123", "role": "user"}')

ALICE_TOKEN=$(echo $ALICE_RESP | grep -oP '(?<="token":")[^"]*')
ALICE_ID=$(echo $ALICE_RESP | grep -oP '(?<="_id":")[^"]*' | head -1)

echo "Alice Token received."

# 4. Protected Access (Authorized)
echo -e "\n4. Testing Authorized Access for Alice: GET /users/me"
curl -s -X GET "$API_URL/users/me" -H "Authorization: Bearer $ALICE_TOKEN" | grep -o '"name":"Alice"'

# 5. Video Management (Mini-Challenge)
echo -e "\n5. Alice creating a video..."
VIDEO_RESP=$(curl -s -X POST "$API_URL/videos" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Alice Lab Video", "description": "Demo video for TA"}')

VIDEO_ID=$(echo $VIDEO_RESP | grep -oP '(?<="_id":")[^"]*' | head -1)
echo "Video created with ID: $VIDEO_ID"

# 6. RBAC & Ownership
echo -e "\n6. Demonstrating RBAC and Ownership..."

# Signup Bob (User)
echo "Signing up Bob (role: user)..."
BOB_RESP=$(curl -s -X POST "$API_URL/users/signup" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "email": "bob@example.com", "password": "password123", "role": "user"}')
BOB_TOKEN=$(echo $BOB_RESP | grep -oP '(?<="token":")[^"]*')

echo "Bob attempting to delete Alice's video (Expected to fail 403)..."
curl -s -X DELETE "$API_URL/videos/$VIDEO_ID" -H "Authorization: Bearer $BOB_TOKEN"

# Signup Admin
echo -e "\nSigning up Admin (role: admin)..."
ADMIN_RESP=$(curl -s -X POST "$API_URL/users/signup" \
  -H "Content-Type: application/json" \
  -d '{"name": "Master Admin", "email": "admin@example.com", "password": "password123", "role": "admin"}')
ADMIN_TOKEN=$(echo $ADMIN_RESP | grep -oP '(?<="token":")[^"]*')

echo "Admin deleting Alice's video (Expected to succeed 204)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/videos/$VIDEO_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "HTTP Status: $STATUS"

echo -e "\n------------------------------------------------"
echo "Walkthrough Complete!"
echo "------------------------------------------------"
