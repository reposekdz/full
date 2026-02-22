@echo off
color 0B
echo ========================================
echo PARENT SYSTEM VERIFICATION
echo Testing All Components
echo ========================================
echo.

set PASS=0
set FAIL=0

echo [1/10] Checking database tables...
mysql -u root -e "USE school_management; SHOW TABLES LIKE 'parent%%';" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database tables exist
    set /a PASS+=1
) else (
    echo [FAIL] Database tables missing - Run setup first
    set /a FAIL+=1
)

echo [2/10] Checking backend routes...
if exist backend\routes\dodParentLink.js (
    echo [OK] dodParentLink.js exists
    set /a PASS+=1
) else (
    echo [FAIL] dodParentLink.js missing
    set /a FAIL+=1
)

if exist backend\routes\parentDashboard.js (
    echo [OK] parentDashboard.js exists
    set /a PASS+=1
) else (
    echo [FAIL] parentDashboard.js missing
    set /a FAIL+=1
)

if exist backend\routes\parentPayments.js (
    echo [OK] parentPayments.js exists
    set /a PASS+=1
) else (
    echo [FAIL] parentPayments.js missing
    set /a FAIL+=1
)

echo [3/10] Checking SMS service...
if exist backend\services\smsService.js (
    echo [OK] SMS service exists
    set /a PASS+=1
) else (
    echo [FAIL] SMS service missing
    set /a FAIL+=1
)

echo [4/10] Checking environment configuration...
if exist backend\.env (
    echo [OK] .env file exists
    set /a PASS+=1
) else (
    echo [WARN] .env file missing - will be created
    set /a FAIL+=1
)

echo [5/10] Checking frontend components...
if exist src\app\pages\ParentDashboard.tsx (
    echo [OK] ParentDashboard component exists
    set /a PASS+=1
) else (
    echo [FAIL] ParentDashboard component missing
    set /a FAIL+=1
)

echo [6/10] Checking migrations...
if exist backend\migrations\parent_system_complete.sql (
    echo [OK] Migration file exists
    set /a PASS+=1
) else (
    echo [FAIL] Migration file missing
    set /a FAIL+=1
)

echo [7/10] Checking documentation...
if exist PARENT_SYSTEM_COMPLETE_GUIDE.md (
    echo [OK] Documentation exists
    set /a PASS+=1
) else (
    echo [WARN] Documentation missing
)

echo [8/10] Testing database connection...
mysql -u root -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database connection successful
    set /a PASS+=1
) else (
    echo [FAIL] Database connection failed - Check MySQL
    set /a FAIL+=1
)

echo [9/10] Checking Node.js dependencies...
if exist backend\node_modules\bcryptjs (
    echo [OK] bcryptjs installed
    set /a PASS+=1
) else (
    echo [FAIL] bcryptjs not installed
    set /a FAIL+=1
)

echo [10/10] Checking server configuration...
findstr /C:"dodParentLink" backend\server.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Routes registered in server.js
    set /a PASS+=1
) else (
    echo [FAIL] Routes not registered
    set /a FAIL+=1
)

echo.
echo ========================================
echo VERIFICATION RESULTS
echo ========================================
echo Tests Passed: %PASS%
echo Tests Failed: %FAIL%
echo.

if %FAIL% equ 0 (
    color 0A
    echo [SUCCESS] All tests passed! System is ready!
    echo.
    echo You can now:
    echo 1. Start backend: cd backend ^&^& npm start
    echo 2. Start frontend: npm run dev
    echo 3. Login as DOD and link parents
    echo 4. Parents will receive SMS automatically
) else (
    color 0C
    echo [WARNING] Some tests failed!
    echo Please run setup-parent-system-complete.bat again
)

echo.
echo Press any key to exit...
pause >nul
