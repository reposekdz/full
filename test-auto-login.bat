@echo off
echo ========================================
echo Parent Auto-Login Feature - Quick Test
echo ========================================
echo.

echo This script will help you test the auto-login feature after registration.
echo.

echo Step 1: Make sure the backend is running
echo -----------------------------------------
echo Open a new terminal and run:
echo   cd backend
echo   npm start
echo.
pause

echo Step 2: Make sure the frontend is running
echo ------------------------------------------
echo Open another terminal and run:
echo   npm run dev
echo.
pause

echo Step 3: Test Parent Registration
echo ---------------------------------
echo 1. Open your browser to http://localhost:5173
echo 2. Click on "Iyandikishe" (Register)
echo 3. Fill in the registration form:
echo    - Select "Umubyeyi" (Parent) role
echo    - Enter your information
echo    - Enter student information
echo 4. Click "Iyandikishe" (Register)
echo 5. You should see success message
echo 6. After 1 second, you'll be redirected to Parent Dashboard
echo.
echo Expected Result: You should be on the parent dashboard WITHOUT logging in again!
echo.
pause

echo Step 4: Test Student Registration
echo ----------------------------------
echo 1. Logout from parent dashboard
echo 2. Go back to registration page
echo 3. Fill in the registration form:
echo    - Select "Umunyeshuri" (Student) role
echo    - Enter your information
echo    - Enter parent information
echo 4. Click "Iyandikishe" (Register)
echo 5. You should see success message
echo 6. After 1 second, you'll be redirected to Student Dashboard
echo.
echo Expected Result: You should be on the student dashboard WITHOUT logging in again!
echo.
pause

echo Step 5: Verify Login Still Works
echo ----------------------------------
echo 1. Logout from the dashboard
echo 2. Go to login page
echo 3. Login with your registered credentials:
echo    - Parent: Use phone number + password
echo    - Student: Use email + password
echo 4. You should be able to login normally
echo.
pause

echo ========================================
echo Testing Complete!
echo ========================================
echo.
echo If everything worked correctly:
echo - Registration automatically logs you in
echo - You're redirected to your dashboard
echo - You can still login manually later
echo.
echo If you encountered issues:
echo 1. Check browser console (F12) for errors
echo 2. Check backend terminal for errors
echo 3. Verify database is running
echo 4. Check PARENT_AUTO_LOGIN_FEATURE.md for details
echo.
pause
