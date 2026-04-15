@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

title ClipSphere Phase 1 + 2 Demo Launcher

set "OPEN_BROWSER=1"
set "PAUSE_ON_EXIT=1"

for %%A in (%*) do (
    if /I "%%~A"=="--no-open" set "OPEN_BROWSER=0"
    if /I "%%~A"=="--no-pause" set "PAUSE_ON_EXIT=0"
    if /I "%%~A"=="--ci" (
        set "OPEN_BROWSER=0"
        set "PAUSE_ON_EXIT=0"
    )
)

echo ============================================================
echo   ClipSphere Phase 1 + 2 Demo Launcher
echo ============================================================
echo Working directory: %CD%
echo.

where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker CLI was not found in PATH.
    goto :fail
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running.
    goto :fail
)

docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not available in this Docker installation.
    goto :fail
)

where curl.exe >nul 2>&1
if errorlevel 1 (
    echo [ERROR] curl.exe was not found in PATH.
    goto :fail
)

echo [1/4] Starting the Phase 1 + 2 containers...
docker compose down --remove-orphans >nul 2>&1
docker compose up --build -d
if errorlevel 1 goto :fail

echo [2/4] Waiting for backend health...
call :wait_for_url "http://localhost:5000/health" 90
if errorlevel 1 goto :fail

echo [3/4] Waiting for frontend...
call :wait_for_url "http://localhost:3000" 120
if errorlevel 1 goto :fail

echo [4/4] Current container status:
docker compose ps
if errorlevel 1 goto :fail

echo.
echo Demo URLs
echo   Frontend : http://localhost:3000
echo   Swagger  : http://localhost:5000/api/v1/docs
echo   Health   : http://localhost:5000/health
echo   MinIO    : http://localhost:9001   ^(minioadmin / minioadmin^)
echo.
echo Suggested TA demo flow
echo   1. Register or log in from the frontend.
echo   2. Upload an MP4 and show it appears in the feed.
echo   3. Open the video details page and show views, likes, and reviews.
echo   4. Open a creator profile and show follow or unfollow plus their videos.
echo   5. Open Swagger and show the documented Express API.
echo.
echo Notification engine note
echo   The email queue and worker are included in this Phase 2 stack.
echo   SMTP is already preconfigured to match the original project launcher.
echo.

if "%OPEN_BROWSER%"=="1" start "" "http://localhost:3000"

goto :success

:wait_for_url
set "TARGET_URL=%~1"
set "MAX_TRIES=%~2"
if not defined MAX_TRIES set "MAX_TRIES=60"
set /a TRY_COUNT=0

:wait_loop
set /a TRY_COUNT+=1
curl.exe -s -o NUL --connect-timeout 5 --max-time 5 "%TARGET_URL%" >nul 2>&1
if not errorlevel 1 (
    echo     ready: %TARGET_URL%
    exit /b 0
)

if !TRY_COUNT! GEQ %MAX_TRIES% (
    echo [ERROR] Timed out waiting for %TARGET_URL%
    exit /b 1
)

timeout /t 2 /nobreak >nul
goto :wait_loop

:success
echo Launcher finished successfully.
if "%PAUSE_ON_EXIT%"=="1" pause
exit /b 0

:fail
echo.
echo Startup failed. Run `docker compose logs` from this folder for details.
if "%PAUSE_ON_EXIT%"=="1" pause
exit /b 1
