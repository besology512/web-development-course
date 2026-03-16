$baseUrl = "http://localhost:5000/api/v1"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "--- ClipSphere API Testing Script ---" -ForegroundColor Cyan

# 0. Check if Docker cluster is running
Write-Host "Checking Docker cluster status..."
$runningServices = docker-compose ps --services --filter "status=running"
if ($runningServices.Count -lt 2) {
    Write-Host "   Cluster is not fully running. Starting containers..." -ForegroundColor Yellow
    docker-compose up -d
    Write-Host "   Waiting 10 seconds for initialization..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
} else {
    Write-Host "   Cluster is running." -ForegroundColor Green
}

# 1. Register
Write-Host "1. Registering user..."
$regBody = @{
    username = "ps_tester"
    email = "ps@example.com"
    password = "password123"
} | ConvertTo-Json
try {
    $regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -Headers $headers
    Write-Host "   Success: User registered" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Login
Write-Host "2. Logging in..."
$loginBody = @{
    email = "ps@example.com"
    password = "password123"
} | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -Headers $headers
    $token = $loginRes.token
    $headers["Authorization"] = "Bearer $token"
    Write-Host "   Success: Logged in, token received" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. Get Me
Write-Host "3. Getting profile (/users/me)..."
try {
    $meRes = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Get -Headers $headers
    Write-Host "   Success: Username is $($meRes.data.user.username)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Create Video Metadata
Write-Host "4. Creating video metadata..."
$videoBody = @{
    title = "PS Test Video"
    description = "Created via PowerShell"
    duration = 45
    videoURL = "videos/ps-test.mp4"
} | ConvertTo-Json
try {
    $videoRes = Invoke-RestMethod -Uri "$baseUrl/videos" -Method Post -Body $videoBody -Headers $headers
    $videoId = $videoRes.data.video._id
    Write-Host "   Success: Video created with ID $videoId" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Get Public Videos
Write-Host "5. Getting public videos..."
try {
    $videosRes = Invoke-RestMethod -Uri "$baseUrl/videos" -Method Get
    Write-Host "   Success: Found $($videosRes.results) videos" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Health Check
Write-Host "6. Basic Health Check..."
try {
    $healthRes = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
    Write-Host "   Success: $($healthRes.message)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- Testing Completed ---" -ForegroundColor Cyan
