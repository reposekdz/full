@echo off
echo ================================================================================
echo 🚀 QUICK FIX - DOD COMPLETE DATABASE ISSUES
echo ================================================================================
echo.
echo Applying database fixes...

mysql -u root -p school_management < fix-dod-database.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database fixed successfully!
    echo.
    echo 🔄 Restarting server to apply changes...
    echo Press Ctrl+C to stop the server, then run: npm run dev
    echo.
    echo 🎯 DOD Complete system is now ready at:
    echo    http://localhost:5000/dashboards/DODDashboardAdvanced
    echo.
) else (
    echo.
    echo ❌ Database fix failed. Check MySQL connection.
    echo.
)

pause