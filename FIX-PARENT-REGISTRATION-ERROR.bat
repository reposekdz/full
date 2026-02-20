@echo off
echo ========================================
echo  FIXING PARENT REGISTRATION ERROR
echo ========================================
echo.
echo Error: "Ntushobora guhuza na seriveri"
echo Translation: "Cannot connect to server"
echo.
echo CAUSE: Backend server is not running
echo.
echo ========================================
echo  SOLUTION: Start Backend Server
echo ========================================
echo.

cd backend

echo [1/2] Checking if server is already running...
netstat -ano | findstr :5000 >nul
if %errorlevel% == 0 (
    echo ✅ Server is already running on port 5000
    echo.
    echo If you're still getting the error, try:
    echo 1. Clear browser cache
    echo 2. Check API_BASE_URL in frontend config
    echo 3. Restart both frontend and backend
    pause
    exit /b
)

echo ❌ Server is NOT running
echo.
echo [2/2] Starting backend server...
echo.
start cmd /k "npm start"

echo.
echo ========================================
echo  BACKEND SERVER STARTING...
echo ========================================
echo.
echo Wait 10 seconds for server to start...
timeout /t 10 /nobreak

echo.
echo ✅ Backend should now be running!
echo.
echo NEXT STEPS:
echo 1. Go to http://localhost:5173
echo 2. Try parent registration again
echo 3. You should NOT see "Ntushobora guhuza na seriveri" error
echo.
echo If error persists:
echo - Check backend console for errors
echo - Verify MySQL is running
echo - Check .env file has correct database credentials
echo.
pause
