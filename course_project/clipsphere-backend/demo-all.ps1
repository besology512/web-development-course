$baseUrl = "http://localhost:5000/api/v1"
$headers = @{ "Content-Type" = "application/json" }

function Show-Header($text) {
    Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

function Show-Pass($text) {
    Write-Host "  [PASS] $text" -ForegroundColor Green
}

function Show-Fail($text, $details) {
    Write-Host "  [FAIL] $text" -ForegroundColor Red
    if ($details) { Write-Host "         $details" -ForegroundColor Gray }
}

Show-Header "ClipSphere Full Demo Script (with Ownership Check)"

# 1. Admin Features
Show-Header "1. Testing Admin Features"
$adminLoginBody = @{
    email = "admin@clipsphere.com"
    password = "adminpassword123"
} | ConvertTo-Json

try {
    $adminLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -Headers $headers
    $adminToken = $adminLoginRes.token
    Show-Pass "Admin logged in successfully"
    
    $adminHeaders = @{ 
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $adminToken"
    }

    $adminHealthRes = Invoke-RestMethod -Uri "$baseUrl/admin/health" -Method Get -Headers $adminHeaders
    Show-Pass "Admin accessed system health"

    $adminStatsRes = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers $adminHeaders
    Show-Pass "Admin accessed system stats (Total Users: $($adminStatsRes.data.totalUsers))"
} catch {
    Show-Fail "Admin features failed" $_.Exception.Message
}

# 2. User A: Create Video
Show-Header "2. User A: Creating Content"
$userALoginBody = @{
    email = "user_a@clipsphere.com"
    password = "userpassword123"
} | ConvertTo-Json

try {
    $userALoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $userALoginBody -Headers $headers
    $userAToken = $userALoginRes.token
    Show-Pass "User A logged in"

    $userAHeaders = @{ 
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $userAToken"
    }

    $videoBody = @{
        title = "User A's Video"
        description = "This video belongs to User A"
        duration = 60
        videoURL = "videos/usera.mp4"
    } | ConvertTo-Json
    $videoRes = Invoke-RestMethod -Uri "$baseUrl/videos" -Method Post -Body $videoBody -Headers $userAHeaders
    $videoId = $videoRes.data.video._id
    Show-Pass "User A created a video (ID: $videoId)"
} catch {
    Show-Fail "User A setup failed" $_.Exception.Message
}

# 3. User B: Ownership/Security Test
Show-Header "3. User B: Ownership/Security Test"
$userBLoginBody = @{
    email = "user_b@clipsphere.com"
    password = "userpassword123"
} | ConvertTo-Json

try {
    $userBLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $userBLoginBody -Headers $headers
    $userBToken = $userBLoginRes.token
    Show-Pass "User B logged in"

    $userBHeaders = @{ 
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $userBToken"
    }

    # ATTEMPT TO DELETE USER A'S VIDEO
    Write-Host "  User B attempting to delete User A's video..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$baseUrl/videos/$videoId" -Method Delete -Headers $userBHeaders
        Show-Fail "Security Check" "User B successfully deleted User A's video! (This is a BUG!)"
    } catch {
        if ($_.Exception.Response.StatusCode -eq "Forbidden" -or $_.Exception.Message -match "403") {
            Show-Pass "Security Check: User B was Forbidden from deleting User A's video (Correct Behavior)"
        } else {
            Show-Fail "Security Check" "Expected 403 Forbidden, but got $($_.Exception.Response.StatusCode) - $($_.Exception.Message)"
        }
    }
} catch {
    Show-Fail "User B test failed" $_.Exception.Message
}

# 4. Admin Bypass: Admin Deletes User A's Video
Show-Header "4. Admin Bypass: Admin Deletes User A's Video"
try {
    # User A creates another video
    $videoBody2 = @{
        title = "User A's Second Video"
        description = "This should be deleted by Admin"
        duration = 10
        videoURL = "videos/admin-delete-test.mp4"
    } | ConvertTo-Json
    $videoRes2 = Invoke-RestMethod -Uri "$baseUrl/videos" -Method Post -Body $videoBody2 -Headers $userAHeaders
    $videoId2 = $videoRes2.data.video._id
    Show-Pass "User A created a second video (ID: $videoId2)"

    # Admin deletes it
    Write-Host "  Admin attempting to delete User A's video..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "$baseUrl/videos/$videoId2" -Method Delete -Headers $adminHeaders
    Show-Pass "Admin successfully deleted User A's video (Admin Bypass Verified)"
} catch {
    Show-Fail "Admin bypass test failed" $_.Exception.Message
}

# 5. User A: Cleanup
Show-Header "5. User A: Cleanup"
try {
    Invoke-RestMethod -Uri "$baseUrl/videos/$videoId" -Method Delete -Headers $userAHeaders
    Show-Pass "User A deleted their own video successfully"
} catch {
    Show-Fail "User A cleanup failed" $_.Exception.Message
}

Show-Header "Demo Scenario Completed Successfully"
