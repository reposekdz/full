@echo off
echo ========================================
echo Parent Login Credentials Checker
echo ========================================
echo.
echo Phone: 0796329328
echo Password: 1234567
echo.

:menu
echo What would you like to do?
echo.
echo 1. Check if credentials exist in database
echo 2. Create/Update parent account with these credentials
echo 3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto check
if "%choice%"=="2" goto create
if "%choice%"=="3" goto end
goto menu

:check
echo.
echo Checking database...
echo.
cd backend
node check-parent-login.js
cd ..
echo.
pause
goto menu

:create
echo.
echo Creating/Updating parent account...
echo.
cd backend
node create-test-parent.js
cd ..
echo.
echo ========================================
echo DONE! You can now login with:
echo ========================================
echo Phone: 0796329328
echo Password: 1234567
echo.
echo Go to: http://localhost:5173
echo Click: Login
echo Select: Telefoni (Phone) tab
echo Enter the credentials above
echo.
pause
goto menu

:end
echo.
echo Goodbye!
echo.
pause
