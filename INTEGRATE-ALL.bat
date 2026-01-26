@echo off
echo ========================================
echo MASTER SYSTEM INTEGRATION
echo ========================================
echo.
echo Integrating all components together...
echo - Staff with Trades
echo - Students with Trades
echo - Classes with Staff
echo - Assignments with Classes
echo - Grades with Students
echo - Attendance tracking
echo.

cd backend
node scripts/master-integration.js

echo.
echo ========================================
echo Integration Complete!
echo ========================================
echo.
echo All systems are now fully integrated!
echo.
pause
