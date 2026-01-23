@echo off
echo Stopping existing server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting production server...
echo.
node server.js
