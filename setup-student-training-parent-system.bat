@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ============================================
echo STUDENT TRAINING ^& PARENT SYSTEM SETUP
echo ============================================

echo.
echo Running database migration...
cd backend

set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist %MYSQL_PATH% set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
if not exist %MYSQL_PATH% set MYSQL_PATH=mysql

%MYSQL_PATH% -u root -p < migrations/student-training-parent-system.sql

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo MIGRATION COMPLETED SUCCESSFULLY!
    echo ============================================
    echo.
    echo The following features are now available:
    echo.
    echo STUDENT TRAINING:
    echo - Training programs management
    echo - Module management
    echo - Training sessions scheduling
    echo - Student enrollments
    echo - Module progress tracking
    echo - Assessment management
    echo - Training resources
    echo.
    echo PARENT PORTAL:
    echo - Enhanced parent dashboard
    echo - Child academics monitoring
    echo - Child attendance tracking
    echo - Child finance management
    echo - Discipline monitoring
    echo - Parent messaging
    echo - Payment proof submission
    echo - Notification settings
    echo.
    echo STUDENT-PARENT LINKING:
    echo - Parent verification requests
    echo - Admin approval workflow
    echo - Direct linking by staff
    echo - Access control permissions
    echo - Activity logging
    echo.
) else (
    echo.
    echo ERROR: Migration failed. Please check your database connection.
    echo.
)

pause
