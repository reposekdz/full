@echo off
echo ============================================================================
echo FIX CONDUCT SCORE TO 40-POINT SYSTEM WITH PARENT NOTIFICATIONS
echo ============================================================================
echo.

cd /d "%~dp0backend"

echo [1/3] Applying database schema fixes...
mysql -u root -p garden_tvet_db < migrations/fix-conduct-40-point-system.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to apply database fixes
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying conduct scores...
mysql -u root -p garden_tvet_db -e "SELECT COUNT(*) as students_with_40_max, AVG(conduct_score) as avg_score FROM global_student_sheets WHERE status='active';"

echo.
echo [3/3] Checking parent connections...
mysql -u root -p garden_tvet_db -e "SELECT COUNT(DISTINCT student_id) as students_with_parents FROM parent_connections WHERE status='active';"

echo.
echo ============================================================================
echo SUCCESS! Conduct 40-point system is now active
echo ============================================================================
echo.
echo What was fixed:
echo   - All conduct scores are now out of 40 (not 100)
echo   - Students start with 40/40 (full conduct)
echo   - When conduct is removed, parents receive SMS automatically
echo   - Conduct grades: A (36-40), B (32-35), C (28-31), D (24-27), F (0-23)
echo.
echo Next steps:
echo   1. Restart backend: cd backend ^&^& npm start
echo   2. Test conduct removal in DOD dashboard
echo   3. Verify parent receives SMS notification
echo.
pause
