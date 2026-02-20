@echo off
echo ========================================
echo Parent Portal Interactive Setup
echo ========================================
echo.

cd backend

echo Setting up database tables...
node scripts/setup-parent-portal-interactive.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Restart backend: cd backend ^&^& npm start
echo 2. Login as parent
echo 3. Access: http://localhost:5173/parent-dashboard-interactive
echo.
echo Features Available:
echo - Monitor child's conduct records
echo - Track attendance in real-time
echo - View grades and academic performance
echo - Check fee status and make payments
echo - View assignments and submissions
echo - Submit leave requests
echo - Receive notifications
echo - Message teachers directly
echo.
pause
