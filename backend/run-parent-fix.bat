@echo off
echo ========================================
echo FIX PARENT LINKING - Node.js Script
echo ========================================
echo.

cd /d "%~dp0"

echo Running fix script...
node fix-parent-linking.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Now restart backend
    echo ========================================
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo ERROR! Check the error message above
    echo ========================================
    echo.
    pause
)
