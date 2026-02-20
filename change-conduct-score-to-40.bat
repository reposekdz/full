@echo off
echo ========================================
echo Change Conduct Score: 100 to 40
echo ========================================
echo.
echo This will change the conduct scoring system:
echo - Default score: 100 → 40
echo - Grade thresholds updated for 40-point scale
echo - Existing default scores (100) will be changed to 40
echo.
pause

cd backend

echo.
echo Running migration...
mysql -u root -p school_management_db < migrations\change-conduct-score-to-40.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Conduct score changed to 40
    echo ========================================
    echo.
    echo New Grading Scale (out of 40):
    echo - A: 36-40 points (Excellent)
    echo - B: 32-35 points (Good)
    echo - C: 28-31 points (Satisfactory)
    echo - D: 24-27 points (Needs Improvement)
    echo - F: 0-23 points (Unsatisfactory)
    echo.
    echo Please restart your backend server.
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Migration failed
    echo ========================================
    echo.
)

pause
