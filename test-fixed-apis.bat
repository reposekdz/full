@echo off
echo ========================================
echo TESTING FIXED API ENDPOINTS
echo ========================================

echo.
echo Testing the fixed global-student-sheets endpoints...
echo.

node test-fixed-apis.js

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo If you see ✅ marks, the APIs are working correctly
echo If you see ❌ marks, there may still be issues
echo.
echo Press any key to exit...
pause >nul