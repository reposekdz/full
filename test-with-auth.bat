@echo off
REM ========================================
REM Test with Authentication Token
REM ========================================

echo.
echo ========================================
echo  Testing with Authentication
echo ========================================
echo.

echo [1/3] Getting authentication token...
echo.

REM Login to get token
curl -X POST "http://localhost:5000/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"dos\",\"password\":\"dos123\"}" ^
  -o token.json 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Could not connect to backend
    echo Please ensure backend is running: cd backend ^&^& npm start
    pause
    exit /b 1
)

REM Extract token from response
for /f "tokens=2 delims=:," %%a in ('type token.json ^| findstr "token"') do set TOKEN=%%a
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%

if "%TOKEN%"=="" (
    echo [FAIL] Could not get authentication token
    echo Please check credentials: username=dos, password=dos123
    type token.json
    pause
    exit /b 1
)

echo [PASS] Authentication token obtained
echo.

echo [2/3] Testing API endpoints with token...
echo.

echo Testing all students...
curl -X GET "http://localhost:5000/api/dos-management/students?limit=5" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo.
echo Testing Level 4 SOD students...
curl -X GET "http://localhost:5000/api/dos-management/students?trade_code=SOD&level_number=4&limit=5" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo.
echo Testing with gender filter...
curl -X GET "http://localhost:5000/api/dos-management/students?gender=male&limit=5" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo.
echo Testing search by name...
curl -X GET "http://localhost:5000/api/dos-management/students?search=john&limit=5" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo.

echo [3/3] Cleaning up...
del token.json 2>nul

echo.
echo ========================================
echo  Testing Complete!
echo ========================================
echo.

echo All API tests completed with authentication.
echo.
echo If you see student data above, the system is working correctly!
echo.

pause
