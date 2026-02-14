@echo off
echo ================================================================================
echo                    DOD COMPLETE SYSTEM - DATABASE FIX
echo ================================================================================
echo.
echo This script will fix the missing database columns and tables for DOD Complete System
echo.
echo What this script does:
echo - Adds missing conduct_status column to global_student_sheets
echo - Adds missing parent_phone and parent_name columns to parent_connections  
echo - Creates discipline_records table if missing
echo - Creates student_leaves table if missing
echo - Creates parent_messages table if missing
echo - Adds sample parent connections for testing
echo - Updates conduct grades and statuses
echo.

set /p confirm="Do you want to continue? (y/n): "
if /i "%confirm%" neq "y" (
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo [1/3] Connecting to MySQL and executing database fixes...

mysql -u root -p school_management_system < fix-dod-database.sql

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Failed to execute database fixes
    echo Please check:
    echo - MySQL is running
    echo - Database 'school_management_system' exists
    echo - You have proper permissions
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database schema fixed successfully!
echo.

echo [2/3] Restarting backend server...
cd backend
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo [3/3] Starting frontend...
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "npm run dev"

echo.
echo ================================================================================
echo                           ✅ DOD COMPLETE SYSTEM FIXED!
echo ================================================================================
echo.
echo The database schema has been fixed with:
echo ✅ conduct_status column added to global_student_sheets
echo ✅ parent_phone and parent_name columns added to parent_connections
echo ✅ All required tables created (discipline_records, student_leaves, parent_messages)
echo ✅ Sample parent connections added for testing
echo ✅ Conduct grades and statuses updated
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo 📱 DOD Complete System Features:
echo - View all students with parent information
echo - Remove conduct with automatic SMS to ALL linked parents
echo - Grant leave with automatic SMS to ALL linked parents  
echo - Message parents individually or in bulk
echo - Real-time statistics and history tracking
echo.
echo The system should now work without database errors!
echo.
pause