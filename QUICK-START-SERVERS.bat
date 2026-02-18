@echo off
echo ========================================
echo GARDEN TVET - QUICK START
echo ========================================
echo.

echo Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "Garden TVET Backend" cmd /k "echo Backend Server Running on http://localhost:5000 && echo. && echo API Endpoints Available: && echo - Auth: /api/auth && echo - Students: /api/students && echo - Staff: /api/staff && echo - DOD: /api/dod && echo - DOS: /api/dos && echo - SMS: /api/sms && echo - News: /api/news && echo - Sports: /api/sports && echo - Trades: /api/trades && echo - Applications: /api/applications && echo. && node server.js"
echo.

timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server (Port 5173)...
cd /d "%~dp0"
start "Garden TVET Frontend" cmd /k "echo Frontend Server Running on http://localhost:5173 && npm run dev"
echo.

timeout /t 5 /nobreak >nul

echo ========================================
echo SERVERS STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo Servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
