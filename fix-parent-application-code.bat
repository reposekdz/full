@echo off
echo ========================================
echo FIX: Application Code Duplicate Error
echo ========================================
echo.
echo This will fix the "Duplicate entry for key 'application_code'" error
echo by updating the stored procedure to auto-generate unique codes.
echo.
pause

cd backend
node migrations\fix-application-code.js

echo.
echo ========================================
echo NEXT STEP: Restart Backend Server
echo ========================================
echo.
echo Run: cd backend ^&^& npm start
echo.
pause
