@echo off
cls
echo ========================================
echo FIXING PARENT LOGIN - FINAL FIX
echo ========================================
echo.
echo This will:
echo 1. Update backend to check users table for parents
echo 2. Fix the role for phone 0796329328
echo.
echo Phone: 0796329328
echo Password: 1234567
echo.
pause

echo.
echo Step 1: Fixing user role in database...
echo.
cd /d "%~dp0backend"
node fix-parent-role.js
cd ..

echo.
echo Step 2: Restarting backend server...
echo.
echo Please restart your backend server manually:
echo   cd backend
echo   npm start
echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo You can now login at: http://localhost:5173
echo.
echo Use "Telefoni" tab with:
echo Phone: 0796329328
echo Password: 1234567
echo.
echo The backend now checks BOTH:
echo - parents table
echo - users table (for parents registered there)
echo.
pause
