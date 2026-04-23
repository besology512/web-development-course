# API Demonstration Scripts (CLI)

Use these commands to show your TA how the API handles different scenarios.

## 1. Public Access
Anyone can see the list of videos.
```bash
curl -X GET http://localhost:5000/api/videos
```

## 2. Protected Access (Unauthorized)
This should fail with a **401 Unauthorized** error because no token is provided.
```bash
curl -X GET http://localhost:5000/api/users/me
```

## 3. User Signup & Authentication
Create a normal user and save the token.

**PowerShell (Recommended for Windows CLI):**
```powershell
$resp = Invoke-RestMethod -Uri "http://localhost:5000/api/users/signup" -Method Post -ContentType "application/json" -Body '{"name": "Alice", "email": "alice@example.com", "password": "password123", "role": "user"}'
$ALICE_TOKEN = $resp.token
$ALICE_ID = $resp.data.user._id
echo "Alice Token: $ALICE_TOKEN"
```

---

## 4. Using the Token (Authorized)
Access the `/me` route using Alice's token.
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/me" -Method Get -Headers @{Authorization="Bearer $ALICE_TOKEN"}
```

---

## 5. Mini-Challenge: Video Ownership
Create a video as Alice, then show only the owner can delete it.

**Create Video:**
```powershell
$vResp = Invoke-RestMethod -Uri "http://localhost:5000/api/videos" -Method Post -Headers @{Authorization="Bearer $ALICE_TOKEN"} -ContentType "application/json" -Body '{"title": "My Lab Video", "description": "Showing ownership logic"}'
$VIDEO_ID = $vResp.data.video._id
```

**Attempt Delete as Alice (Owner - Success):**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/videos/$VIDEO_ID" -Method Delete -Headers @{Authorization="Bearer $ALICE_TOKEN"}
```

---

## 6. RBAC (Admin Restrictions)
Normal users cannot delete other users. Only Admins can.

**Signup as Admin:**
```powershell
$aResp = Invoke-RestMethod -Uri "http://localhost:5000/api/users/signup" -Method Post -ContentType "application/json" -Body '{"name": "Admin User", "email": "admin@example.com", "password": "password123", "role": "admin"}'
$ADMIN_TOKEN = $aResp.token
```

**Alice tries to delete Admin (Fail 403 Forbidden):**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/$($aResp.data.user._id)" -Method Delete -Headers @{Authorization="Bearer $ALICE_TOKEN"}
```

**Admin deletes Alice (Success 204):**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/$ALICE_ID" -Method Delete -Headers @{Authorization="Bearer $ADMIN_TOKEN"}
```
