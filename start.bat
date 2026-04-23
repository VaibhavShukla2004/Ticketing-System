@echo off
echo ==========================================
echo  SupportDesk - Ticketing System Startup
echo ==========================================
echo.

:: Check Java
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH.
    echo         Please install Java 21+ from https://adoptium.net/
    pause
    exit /b 1
)

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Check Docker
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo         Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

:: Get the directory of this batch file
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo [1/5] Starting PostgreSQL database via Docker...
cd /d "%ROOT_DIR%"
docker compose up -d db
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start PostgreSQL. Is Docker Desktop running?
    pause
    exit /b 1
)
echo       Waiting for database to be ready...
timeout /t 5 /nobreak >nul
echo       Done.

echo.
echo [2/5] Checking frontend dependencies...
cd /d "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
)
echo       Done.

:: Create uploads directory
if not exist "%ROOT_DIR%uploads" mkdir "%ROOT_DIR%uploads"

echo.
echo [3/5] Starting Spring Boot backend on port 8080...
cd /d "%BACKEND_DIR%"
start "SupportDesk Backend" cmd /k "title SupportDesk Backend && mvnw.cmd spring-boot:run"

echo       Backend starting... (wait ~30 seconds for startup)
echo.

:: Wait before starting frontend
timeout /t 5 /nobreak >nul

echo [4/5] Starting Next.js frontend on port 3000...
cd /d "%FRONTEND_DIR%"
start "SupportDesk Frontend" cmd /k "title SupportDesk Frontend && npm run dev"

echo.
echo [5/5] Opening browser...
timeout /t 8 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ==========================================
echo  System Started Successfully!
echo ==========================================
echo.
echo  Frontend : http://localhost:3000
echo  Backend  : http://localhost:8080
echo  Database : PostgreSQL on port 5432 (Docker)
echo.
echo  Default Credentials:
echo   Admin  : admin / admin123
echo   Agent  : agent1 / agent123
echo   User   : user1 / user123
echo.
echo  To stop the database when done:
echo    docker compose stop db
echo.
echo  Close this window - backend/frontend run in separate windows.
echo ==========================================
