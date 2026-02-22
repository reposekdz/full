@echo off
echo ========================================
echo Ultra Payment System - Database Setup
echo ========================================
echo.

cd backend

echo Running payment migrations with Node.js...
node run-payment-migrations.js

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Migration failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Payment system is ready.
echo ========================================
echo.
echo To start using:
echo 1. Run: npm start
echo 2. Login as accountant/teacher
echo 3. Navigate to Payment Management
echo.
pause
