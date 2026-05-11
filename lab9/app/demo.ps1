# Lab 3 API Automated Demo Script (PowerShell)
$API_URL = "http://localhost:5000/api"

Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "Starting Lab 3 API Automated Walkthrough" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan

# 1. Public Access
Write-Host "`n1. Testing Public Access: GET /videos" -ForegroundColor Yellow
$videos = Invoke-RestMethod -Uri "$API_URL/videos" -Method Get
Write-Host "Results found: $($videos.results)"

# 2. Unauthorized Access
Write-Host "`n2. Testing Unauthorized Access: GET /users/me (Expected to fail)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$API_URL/users/me" -Method Get
}
catch {
    Write-Host "Caught expected error: $($_.Exception.Message)" -ForegroundColor Gray
}

# 3. Signup Alice (User)
Write-Host "`n3. Signing up Alice (role: user)..." -ForegroundColor Yellow
$aliceBody = @{
    name     = "Alice"
    email    = "alice@example.com"
    password = "password123"
    role     = "user"
} | ConvertTo-Json

try {
    $aliceResp = Invoke-RestMethod -Uri "$API_URL/users/signup" -Method Post -ContentType "application/json" -Body $aliceBody
    $ALICE_TOKEN = $aliceResp.token
    $ALICE_ID = $aliceResp.data.user._id
}
catch {
    Write-Host "CRITICAL: Alice Signup failed!" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Host "Response Body: $($_.ErrorDetails.Message)" }
    return
}
Write-Host "Alice Token received."

# 4. Protected Access (Authorized)
Write-Host "`n4. Testing Authorized Access for Alice: GET /users/me" -ForegroundColor Yellow
$meResp = Invoke-RestMethod -Uri "$API_URL/users/me" -Method Get -Headers @{Authorization = "Bearer $ALICE_TOKEN" }
Write-Host "Successfully accessed: $($meResp.data.user.name)"

# 5. Video Management (Mini-Challenge)
Write-Host "`n5. Alice creating a video..." -ForegroundColor Yellow
$videoBody = @{
    title       = "Alice Lab Video"
    description = "Demo video for TA"
} | ConvertTo-Json

$videoResp = Invoke-RestMethod -Uri "$API_URL/videos" -Method Post -Headers @{Authorization = "Bearer $ALICE_TOKEN" } -ContentType "application/json" -Body $videoBody
$VIDEO_ID = $videoResp.data.video._id

if (-not $VIDEO_ID) {
    Write-Host "CRITICAL: Video creation failed!" -ForegroundColor Red
    return
}
Write-Host "Video created with ID: $VIDEO_ID"

# 6. RBAC & Ownership
Write-Host "`n6. Demonstrating RBAC and Ownership..." -ForegroundColor Yellow

# Signup Bob (User)
Write-Host "Signing up Bob (role: user)..."
$bobBody = @{
    name     = "Bob"
    email    = "bob@example.com"
    password = "password123"
    role     = "user"
} | ConvertTo-Json
$bobResp = Invoke-RestMethod -Uri "$API_URL/users/signup" -Method Post -ContentType "application/json" -Body $bobBody
$BOB_TOKEN = $bobResp.token

Write-Host "Bob attempting to delete Alice's video (Expected to fail 403)..." -ForegroundColor DarkYellow
try {
    Invoke-RestMethod -Uri "$API_URL/videos/$VIDEO_ID" -Method Delete -Headers @{Authorization = "Bearer $BOB_TOKEN" }
}
catch {
    Write-Host "Caught expected error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Signup Admin
Write-Host "`nSigning up Admin (role: admin)..." -ForegroundColor Yellow
$adminBody = @{
    name     = "Master Admin"
    email    = "admin@example.com"
    password = "password123"
    role     = "admin"
} | ConvertTo-Json
$adminResp = Invoke-RestMethod -Uri "$API_URL/users/signup" -Method Post -ContentType "application/json" -Body $adminBody
$ADMIN_TOKEN = $adminResp.token

Write-Host "Admin deleting Alice's video (Expected to succeed 204)..." -ForegroundColor Green
$status = Invoke-WebRequest -Uri "$API_URL/videos/$VIDEO_ID" -Method Delete -Headers @{Authorization = "Bearer $ADMIN_TOKEN" } -UseBasicParsing
Write-Host "Response Status: $($status.StatusCode)"

Write-Host "`n------------------------------------------------" -ForegroundColor Cyan
Write-Host "Walkthrough Complete!" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan
