@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Setting up Parent Linking Requests Table
echo ========================================
echo.

cd backend
node scripts/create-parent-linking-table.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Parent linking requests table created
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR! Failed to create table
    echo ========================================
)

cd ..
echo.
pause
