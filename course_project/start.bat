@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

title ClipSphere Phase 1 + 2 Demo Launcher

set "OPEN_BROWSER=1"
set "PAUSE_ON_EXIT=1"
set "FRONTEND_BASE=http://localhost:3000"
set "BACKEND_BASE=http://localhost:5000"
set "HOME_URL=%FRONTEND_BASE%"
set "LOGIN_URL=%FRONTEND_BASE%/login"
set "REGISTER_URL=%FRONTEND_BASE%/register"
set "FEED_URL=%FRONTEND_BASE%/feed"
set "UPLOAD_URL=%FRONTEND_BASE%/upload"
set "ADMIN_URL=%FRONTEND_BASE%/admin"
set "SWAGGER_URL=%BACKEND_BASE%/api/v1/docs"
set "HEALTH_URL=%BACKEND_BASE%/health"
set "MINIO_URL=http://localhost:9001"

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
call :wait_for_url "%HEALTH_URL%" 90
if errorlevel 1 goto :fail

echo [3/4] Waiting for frontend...
call :wait_for_url "%HOME_URL%" 120
if errorlevel 1 goto :fail

echo [4/4] Current container status:
docker compose ps
if errorlevel 1 goto :fail

echo.
echo Demo URLs
echo   Home      : %HOME_URL%
echo   Login     : %LOGIN_URL%
echo   Register  : %REGISTER_URL%
echo   Feed      : %FEED_URL%
echo   Upload    : %UPLOAD_URL%
echo   Admin     : %ADMIN_URL%
echo   Swagger   : %SWAGGER_URL%
echo   Health    : %HEALTH_URL%
echo   MinIO     : %MINIO_URL%   ^(minioadmin / minioadmin^)
echo.
echo Suggested TA demo flow
echo   1. Open Register or Login and create a user session.
echo   2. Open Upload and submit an MP4 clip.
echo   3. Open Feed and show the uploaded video preview.
echo   4. Open Admin and Swagger for moderation and API questions.
echo   5. Open MinIO if asked where the uploaded media is stored.
echo.
echo Notification engine note
echo   The email queue and worker are included in this Phase 2 stack.
echo   SMTP is already preconfigured to match the original project launcher.
echo.

if "%OPEN_BROWSER%"=="1" (
    echo Opening local demo pages...
    call :open_url "%HOME_URL%"
    call :open_url "%REGISTER_URL%"
    call :open_url "%UPLOAD_URL%"
    call :open_url "%ADMIN_URL%"
    call :open_url "%SWAGGER_URL%"
    call :open_url "%MINIO_URL%"
)

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

call :sleep_seconds 2
goto :wait_loop

:open_url
set "TARGET_URL=%~1"
if not defined TARGET_URL exit /b 0
start "" "%TARGET_URL%"
call :sleep_seconds 1
exit /b 0

:sleep_seconds
set "SLEEP_FOR=%~1"
if not defined SLEEP_FOR set "SLEEP_FOR=1"
set /a PING_COUNT=%SLEEP_FOR%+1
ping 127.0.0.1 -n !PING_COUNT! >nul
exit /b 0

:success
echo Launcher finished successfully.
if "%PAUSE_ON_EXIT%"=="1" pause
exit /b 0

:fail
echo.
echo Startup failed. Run `docker compose logs` from this folder for details.
if "%PAUSE_ON_EXIT%"=="1" pause
exit /b 1
