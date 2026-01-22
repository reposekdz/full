@echo off
echo.
echo ========================================================================
echo   Garden TVET School Management System - Quick Start
echo ========================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is running
echo [1/6] Checking MySQL connection...
mysql -u root -e "SELECT 1" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Cannot connect to MySQL. Make sure MySQL is running.
    echo.
    set /p CONTINUE="Do you want to continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

REM Create database if it doesn't exist
echo [2/6] Creating database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS school_management;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo     Database 'school_management' ready
) else (
    echo     [WARNING] Could not create database. It may already exist.
)

REM Install backend dependencies
echo [3/6] Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo     Backend dependencies already installed
)

REM Run comprehensive setup
echo [4/6] Setting up database tables and default data...
node scripts/setup-comprehensive-system.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database setup failed
    pause
    exit /b 1
)

REM Install frontend dependencies
echo [5/6] Installing frontend dependencies...
cd ..
if not exist node_modules (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo     Frontend dependencies already installed
)

echo.
echo ========================================================================
echo   Setup Complete!
echo ========================================================================
echo.
echo   Default Login Credentials:
echo   Email:    reponse@gmail.com
echo   Password: 2026
echo.
echo   These credentials work for ALL staff roles.
echo   Staff can change their credentials through their dashboard.
echo.
echo ========================================================================
echo.
echo [6/6] Starting servers...
echo.
echo   Backend will start on:  http://localhost:5000
echo   Frontend will start on: http://localhost:5173
echo.
echo   Press Ctrl+C to stop the servers
echo.
echo ========================================================================
echo.

REM Start backend in a new window
start "Garden TVET - Backend Server" cmd /k "cd backend && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Garden TVET - Frontend" cmd /k "npm run dev"

echo.
echo   Servers are starting in separate windows...
echo   This window can be closed.
echo.
pause
