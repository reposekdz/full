@echo off
echo ========================================
echo Verify Conduct System
echo ========================================
echo.
echo This will check:
echo - Tables exist
echo - Columns are correct
echo - Views are working
echo - Data is valid
echo.
pause

cd backend

echo.
echo Running verification...
echo.
mysql -u root -p school_management_db < migrations\verify-conduct-system.sql

echo.
echo ========================================
echo Verification Complete
echo ========================================
echo.
echo Check the output above for any ❌ marks.
echo All checks should show ✅
echo.
pause
