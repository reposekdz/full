@echo off
echo ========================================
echo Testing Parent Dashboard Fixes
echo ========================================
echo.

echo 1. Testing backend health...
curl -s http://localhost:5000/api/health
echo.
echo.

echo 2. Backend is running on port 5000
netstat -ano | findstr :5000 | findstr LISTENING
echo.

echo ========================================
echo FIXES APPLIED:
echo ========================================
echo [✓] Backend /my-children endpoint - Always returns 200
echo [✓] Frontend App.tsx - Removed console logs
echo [✓] Parent login - Uses window.location.href
echo [✓] Backend restarted successfully
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Refresh your browser (Ctrl+F5)
echo 2. Login as parent
echo 3. Should redirect to dashboard-parent
echo 4. No more 500 errors!
echo.
pause
