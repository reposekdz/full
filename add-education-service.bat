@echo off
echo ========================================
echo   ADD EDUCATION SERVICE
echo   Fast-Track Primary & Secondary
echo ========================================
echo.

cd backend

echo Adding Education Service...
node scripts/add-education-service.js

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo The education service has been added.
echo You can now see it in the Services page.
echo.
pause
