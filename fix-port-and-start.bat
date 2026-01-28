@echo off
echo.
echo ========================================
echo   FIXING PORT 5000 CONFLICT
echo ========================================
echo.

echo 🔄 Killing processes on port 5000...
netstat -ano | findstr :5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /f /pid %%a 2>nul

echo.
echo 🚀 Starting backend server...
cd /d "%~dp0backend"
npm run dev

pause