@echo off
echo ========================================
echo Teacher Advanced Features Migration
echo ========================================
echo.

cd /d "%~dp0"

echo Running migration for teacher advanced features...
mysql -u root -p school_management < backend\migrations\teacher-advanced-features.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo New features added:
    echo - Lesson Plans table
    echo - Teacher-Parent Messages table
    echo - Teacher Class Assignments table
    echo - Quiz Questions (enhanced)
    echo - Quiz Submissions (enhanced)
    echo - Conduct Records (enhanced)
) else (
    echo.
    echo ========================================
    echo Migration failed. Please check errors.
    echo ========================================
)

pause
