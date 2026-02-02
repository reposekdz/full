@echo off
echo ========================================
echo Restarting Backend Server
echo ========================================
echo.

cd backend

echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend server...
start cmd /k "npm start"

echo.
echo ========================================
echo Backend server is starting...
echo Wait 5 seconds then test the API
echo ========================================
timeout /t 5

echo.
echo Opening test script...
cd ..
call test-trades-api.bat
