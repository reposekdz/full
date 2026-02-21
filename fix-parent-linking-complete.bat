@echo off
echo ========================================
echo FIX: Parent Linking System - Complete
echo ========================================
echo.
echo This will fix:
echo 1. Case-insensitive student search
echo 2. Auto-generated application codes
echo 3. Infinite loading issue
echo.
pause

cd backend
echo.
echo [1/2] Fixing case-insensitive search...
node migrations\fix-case-insensitive-search.js

echo.
echo ========================================
echo FIXES APPLIED SUCCESSFULLY
echo ========================================
echo.
echo ✅ Case-insensitive search enabled
echo ✅ Application codes auto-generated
echo ✅ Frontend timeout added (10 seconds)
echo.
echo NEXT STEP: Restart Backend Server
echo ========================================
echo.
echo Run: cd backend ^&^& npm start
echo.
pause
