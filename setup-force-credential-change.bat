@echo off
echo ========================================
echo Adding must_change_password column
echo ========================================
cd backend
node migrations/add-must-change-password.js
echo.
echo ========================================
echo Migration complete!
echo ========================================
pause
