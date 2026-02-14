@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Stock Management System Setup
echo ========================================
echo.

cd backend

echo [1/2] Installing dependencies...
call npm install mysql2 dotenv
echo.

echo [2/2] Setting up database tables...
node fix-stock-tables.js
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Stock Management System is ready to use.
echo.
echo Features:
echo - Stock Items Management
echo - Stock Transactions (Purchase, Issue, Return, etc.)
echo - Stock Requisitions
echo - Procurement Orders
echo - Supplier Management
echo - Real-time Statistics
echo - Low Stock Alerts
echo.
pause
