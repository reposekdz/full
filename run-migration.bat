@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Running Comprehensive System Migration
echo ========================================
echo.

cd backend

echo Please enter your MySQL credentials:
set /p DB_USER="MySQL Username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_NAME="Database Name (default: school_management): "
if "%DB_NAME%"=="" set DB_NAME=school_management_db

echo.
echo Running migration...
echo.

mysql -u %DB_USER% -p %DB_NAME% < migrations\comprehensive-system-migration.sql

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ========================================
  echo Migration completed successfully!
  echo ========================================
) else (
  echo.
  echo ========================================
  echo Migration failed!
  echo ========================================
  echo Please check:
  echo 1. MySQL is running
  echo 2. Database exists
  echo 3. Credentials are correct
  echo 4. Migration file exists
)

echo.
pause
