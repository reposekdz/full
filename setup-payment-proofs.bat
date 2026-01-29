@echo off
echo ========================================
echo Payment Proof System Setup
echo ========================================
echo.

cd backend

echo [1/2] Installing dependencies...
call npm install multer
echo.

echo [2/2] Setting up database...
node setup-payment-proofs.js
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Payment Proof System is ready!
echo.
echo Features:
echo - Parents submit payment images
echo - Accountants verify payments
echo - Automatic notifications
echo - Status tracking
echo - Statistics dashboard
echo.
pause
