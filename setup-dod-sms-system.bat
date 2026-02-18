@echo off
echo ========================================
echo DOD SMS SYSTEM - DATABASE SETUP
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/2] Applying database schema...
mysql -u root -p school_management < migrations\dod_sms_system_complete.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database schema applied
    echo ========================================
    echo.
    echo Tables created:
    echo   - student_health_records
    echo   - conduct_records
    echo   - student_leaves
    echo   - student_expulsions
    echo   - punishments
    echo   - sms_messages
    echo   - sms_templates
    echo   - dod_activity_log
    echo   - parent_student_links
    echo.
    echo Views created:
    echo   - v_student_complete_history
    echo   - v_students_gone
    echo.
    echo SMS Templates installed: 5 default templates
    echo.
    echo ========================================
    echo READY TO USE!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Start server: npm run dev
    echo 2. Configure Africa's Talking API in .env
    echo 3. Test SMS: POST /api/dod-actions/actions/student-sick
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Database setup failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database 'school_management' exists
    echo 3. MySQL credentials are correct
    echo.
)

pause
