@echo off
echo ================================================================================
echo                    DOD COMPLETE SYSTEM - API TEST
echo ================================================================================
echo.
echo This script will test the DOD Complete System API endpoints
echo Make sure the backend server is running on http://localhost:5000
echo.

set /p token="Enter your JWT token (or press Enter to skip): "

echo.
echo Testing API endpoints...
echo.

if "%token%"=="" (
    echo ⚠️  No token provided - testing public endpoints only
    echo.
    
    echo [1] Testing server health...
    curl -s http://localhost:5000/api/health 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Backend server not responding
        echo Please start the backend server first: cd backend && npm run dev
        pause
        exit /b 1
    )
    echo ✅ Server is running
    echo.
    
) else (
    echo 🔑 Testing with authentication token...
    echo.
    
    echo [1] Testing get all students...
    curl -s -H "Authorization: Bearer %token%" http://localhost:5000/api/dod-complete/students/all
    echo.
    echo.
    
    echo [2] Testing statistics...
    curl -s -H "Authorization: Bearer %token%" http://localhost:5000/api/dod-complete/statistics
    echo.
    echo.
)

echo ================================================================================
echo                              TEST COMPLETE
echo ================================================================================
echo.
echo If you see JSON responses above, the API is working correctly!
echo.
echo 📱 DOD Complete System Endpoints:
echo - GET  /api/dod-complete/students/all (get all students with parent info)
echo - POST /api/dod-complete/conduct/remove (remove conduct with SMS)
echo - POST /api/dod-complete/leave/grant (grant leave with SMS)
echo - POST /api/dod-complete/message-parents (message parents)
echo - GET  /api/dod-complete/statistics (get dashboard stats)
echo.
echo 🌐 Frontend URL: http://localhost:3000
echo 🔧 Backend URL:  http://localhost:5000
echo.
pause