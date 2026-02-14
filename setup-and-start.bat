@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo School Management System Setup
echo ========================================
echo.

echo [1/2] Setting up database with default users...
cd backend
node setup-default-users.js
echo.

echo [2/2] Starting backend server...
echo.
echo ========================================
echo System Ready!
echo ========================================
echo.
echo Default Credentials:
echo   Email: reponsekldz06@gmail.com
echo   Password: 2026
echo.
echo Available Roles:
echo   - admin, headmaster, dos, dod
echo   - accountant, stockmanager, patron, advisor
echo   - teacher_demo, student_demo, parent_demo
echo.
echo API Documentation: http://localhost:5000/api/docs
echo ========================================
echo.

node server.js
