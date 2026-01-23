@echo off
echo Restarting Backend Server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
cd backend
start cmd /k "npm start"
echo Server restarted!
pause
