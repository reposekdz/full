@echo off
echo ========================================
echo TESTING AFRICA'S TALKING ^& JWT
echo ========================================
echo.

cd /d "%~dp0backend"

echo Installing test dependencies...
call npm install africastalking jsonwebtoken dotenv --save
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install packages
    echo Please run as Administrator or install manually:
    echo   cd backend
    echo   npm install africastalking jsonwebtoken dotenv
    echo.
    cd ..
    pause
    exit /b 1
)
echo.

echo Running tests...
echo.
node test-sms-jwt.js

cd ..
echo.
pause
