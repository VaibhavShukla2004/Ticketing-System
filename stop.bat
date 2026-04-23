@echo off
echo ==========================================
echo  SupportDesk - Stopping Services
echo ==========================================
echo.

echo [1/2] Stopping PostgreSQL database...
docker compose stop db
echo       Done.

echo.
echo [2/2] Note: Backend and frontend windows can be closed manually.
echo.
echo ==========================================
echo  Database stopped successfully.
echo ==========================================
pause
