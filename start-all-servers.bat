@echo off
echo 🚀 Starting All Servers for Powerful School Management System
echo ================================================================

echo.
echo 📊 Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo ⏳ Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🎨 Starting Frontend Development Server (Port 5173)...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ All servers are starting!
echo.
echo 📋 Server Information:
echo    - Backend API: http://localhost:5000
echo    - Frontend App: http://localhost:5173
echo    - Admin Panel: http://localhost:5173/admin
echo    - Parent Portal: http://localhost:5173/dashboard-parent
echo    - Teacher Portal Advanced: http://localhost:5173/teacher-portal-advanced
echo    - Stock Ultra Advanced: http://localhost:5173/stock-ultra-advanced
echo.
echo 🔧 Missing Components Fixed:
echo    ✅ Parent Dashboard - Now available
echo    ✅ Teacher Portal Advanced - Now available  
echo    ✅ Stock Ultra Advanced - Now available
echo.
echo Press any key to exit this window...
pause > nul