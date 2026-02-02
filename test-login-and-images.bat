@echo off
echo ========================================
echo Login & Trade Images - Quick Test
echo ========================================
echo.

echo FEATURE 1: Login with Registered Credentials
echo =============================================
echo.
echo Parents can now login with:
echo   - Phone + Password (Original)
echo   - Email + Password (NEW!)
echo.
echo Students can now login with:
echo   - Serial Code + Password (Original)
echo   - Email + Password (NEW!)
echo.
pause

echo FEATURE 2: Real Trade Images
echo =============================
echo.
echo Trade cards now show real images from:
echo   - Software Development: /uploads/trades/sod.jpg
echo   - Building Construction: /uploads/trades/bdc.jpg
echo   - Automobile Technology: /uploads/trades/aut1.jpg
echo.
pause

echo TEST STEPS
echo ==========
echo.
echo Step 1: Start Backend
echo ---------------------
cd backend
start cmd /k "npm start"
echo Backend starting on http://localhost:5000
echo.
timeout /t 3

echo Step 2: Start Frontend
echo ----------------------
cd ..
start cmd /k "npm run dev"
echo Frontend starting on http://localhost:5173
echo.
timeout /t 3

echo Step 3: Test Parent Login with Email
echo -------------------------------------
echo 1. Register a parent account
echo 2. Note the email and password
echo 3. Go to login page
echo 4. Click "Email" tab
echo 5. Enter registered email + password
echo 6. Click "Injira" (Login)
echo 7. Should redirect to parent dashboard
echo.
pause

echo Step 4: Test Student Login with Email
echo ---------------------------------------
echo 1. Register a student account
echo 2. Note the email and password
echo 3. Go to login page
echo 4. Click "Email" tab
echo 5. Enter registered email + password
echo 6. Click "Injira" (Login)
echo 7. Should redirect to student dashboard
echo.
pause

echo Step 5: Test Trade Images
echo --------------------------
echo 1. Go to homepage (http://localhost:5173)
echo 2. Scroll to "Trades Offered" section
echo 3. Verify images are displayed:
echo    - Software Development (computer/coding image)
echo    - Building Construction (construction image)
echo    - Automobile Technology (car/mechanic image)
echo 4. Images should NOT be the same placeholder
echo.
pause

echo Step 6: Verify Image URLs
echo --------------------------
echo 1. Right-click on a trade image
echo 2. Select "Inspect" or "Inspect Element"
echo 3. Check the src attribute
echo 4. Should be: http://localhost:5000/uploads/trades/[code].jpg
echo.
pause

echo ========================================
echo Testing Complete!
echo ========================================
echo.
echo Expected Results:
echo - Parents can login with email ✅
echo - Students can login with email ✅
echo - Trade images show real photos ✅
echo - Images load from backend ✅
echo.
echo If something doesn't work:
echo 1. Check backend is running (port 5000)
echo 2. Check frontend is running (port 5173)
echo 3. Check trade images exist in backend/uploads/trades/
echo 4. Check browser console for errors (F12)
echo.
echo Documentation: LOGIN_AND_IMAGES_UPDATE.md
echo.
pause
