@echo off
echo ========================================
echo FIX PARENT LINKING DATABASE
echo ========================================
echo.

cd /d "%~dp0"

echo Running SQL fix...
mysql -u root -p school_management < fix-parent-linking-tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Parent linking tables fixed
    echo ========================================
    echo.
    echo Now restart the backend:
    echo   cd backend
    echo   npm start
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Failed to run SQL
    echo ========================================
    echo.
    echo Make sure MySQL is running and password is correct
    echo.
)

pause
