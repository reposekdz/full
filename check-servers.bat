@echo off
echo ========================================
echo Checking Server Status...
echo ========================================
echo.

echo [1/2] Checking Backend (Port 5000)...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo ✅ Backend is RUNNING on port 5000
) else (
    echo ❌ Backend is NOT running on port 5000
    echo    Run: cd backend ^&^& npm start
)
echo.

echo [2/2] Checking Frontend (Port 5173)...
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend is RUNNING on port 5173
) else (
    echo ❌ Frontend is NOT running on port 5173
    echo    Run: npm run dev
)
echo.

echo ========================================
echo Testing Backend API...
echo ========================================
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is responding
    echo    URL: http://localhost:5000/api/health
) else (
    echo ❌ Backend API is not responding
    echo    Make sure backend server is running
)
echo.

echo ========================================
echo Quick Actions:
echo ========================================
echo 1. Start both servers: start-servers.bat
echo 2. Check this status again: check-servers.bat
echo 3. View full guide: PARENT_DASHBOARD_FIX.md
echo ========================================
echo.
pause
