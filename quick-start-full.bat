@echo off
echo ========================================
echo Garden TVET - Quick Start
echo ========================================
echo.

echo [1/3] Initializing Database...
cd backend
node scripts/init-auth-database.js

echo.
echo [2/3] Starting Backend Server...
start cmd /k "npm start"

echo.
echo [3/3] Starting Frontend...
cd ..
start cmd /k "npm run dev"

echo.
echo ========================================
echo System Started Successfully!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Demo Login:
echo Email: reponse@gmail.com
echo Password: 2026
echo ========================================
pause
