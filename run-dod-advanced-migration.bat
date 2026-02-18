@echo off
echo ========================================
echo DOD Advanced Features Migration
echo ========================================
echo.

cd /d "%~dp0"

echo Running migration for DOD advanced features...
mysql -u root -p school_management < backend\migrations\dod-advanced-features.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo New DOD features added:
    echo - SOD (Students of Discipline) table
    echo - Conduct Removals table
    echo - SMS Notifications table
    echo - Teacher Class Assignments table
    echo - Parent links enhancements
    echo - Conduct records enhancements
) else (
    echo.
    echo ========================================
    echo Migration failed. Please check errors.
    echo ========================================
)

pause
