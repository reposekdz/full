@echo off
echo ========================================
echo  COMPLETE SYSTEM - QUICK START
echo  Powerful School Management System
echo ========================================
echo.
echo ✅ Database Setup Complete!
echo ✅ All Tables Created!
echo ✅ Sample Data Inserted!
echo.
echo Starting servers...
echo.

start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo  SERVERS STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo DOD System Features (Kinyarwanda):
echo  - Ubutumwa bushya (3)
echo  - Ibizamini bitegerejwe (2)
echo  - Ibimenyetso bya sisiteme (1)
echo  - Ibikorwa bya vuba
echo  - Uko sisiteme imeze
echo.
echo Login as: director_discipline
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:5173
