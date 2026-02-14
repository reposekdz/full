@echo off
echo ================================================================================
echo 🔧 FIXING DOD COMPLETE DATABASE ISSUES
echo ================================================================================
echo.
echo This will fix the missing columns and tables for DOD Complete system:
echo - Add conduct_status column to global_student_sheets
echo - Add parent_phone column to parent_connections  
echo - Create missing tables (discipline_records, student_leaves, parent_messages)
echo - Add sample parent connections with phone numbers
echo.
pause

echo.
echo 📊 Connecting to MySQL database...
mysql -u root -p school_management < fix-dod-database.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database fix completed successfully!
    echo.
    echo 🎯 DOD Complete system should now work without errors:
    echo    - Students can be viewed with parent information
    echo    - Conduct removal will work with SMS notifications
    echo    - Leave approval will work with SMS notifications
    echo    - Parent messaging will work properly
    echo    - Statistics will load correctly
    echo.
    echo 🚀 You can now access: http://localhost:5000/dashboards/DODDashboardAdvanced
    echo.
) else (
    echo.
    echo ❌ Database fix failed. Please check your MySQL connection.
    echo    Make sure MySQL is running and you have the correct password.
    echo.
)

pause