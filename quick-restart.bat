@echo off
echo Restarting backend...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
cd backend
start cmd /k "npm start"
echo Backend restarted! Wait 5 seconds then refresh browser.
timeout /t 5
