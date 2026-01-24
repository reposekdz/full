@echo off
echo ========================================
echo   GARDEN TVET COMPREHENSIVE SYSTEM
echo ========================================
echo.
echo Starting comprehensive backend server...
echo.

cd backend
start "Backend Server" cmd /k "node server-comprehensive.js"

timeout /t 3 /nobreak > nul

cd ..
echo.
echo Starting frontend development server...
echo.
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   System Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:5000/api/docs
echo Health:   http://localhost:5000/api/health
echo.
echo Press any key to exit...
pause > nul
