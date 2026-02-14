@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo SMS Messaging System Setup
echo ========================================
echo.

echo Installing Africa's Talking SDK...
cd backend
call npm install africastalking
echo.

echo Setting up database tables...
node scripts/setup-sms-system.js
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm start
echo 2. Start frontend: npm run dev
echo 3. Access SMS Messaging from staff dashboard
echo.
echo API Endpoints:
echo - POST /api/sms/send - Send to single parent
echo - POST /api/sms/bulk - Send to multiple parents
echo - POST /api/sms/send-to-class - Send to class
echo - POST /api/sms/send-to-all - Send to all parents
echo - GET /api/sms/history - Message history
echo - GET /api/sms/stats - Statistics
echo - GET /api/sms/balance - Check balance
echo.
pause
