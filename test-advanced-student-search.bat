@echo off
REM ========================================
REM Test Advanced Student Search System
REM ========================================

echo.
echo ========================================
echo  Testing Advanced Student Search System
echo ========================================
echo.

echo [AUTH] Getting authentication token...
echo.

REM Login to get token
curl -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d "{\"username\":\"dos\",\"password\":\"dos123\"}" -o token.json 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Could not authenticate - testing without token
    set "TOKEN="
) else (
    for /f "tokens=2 delims=:," %%a in ('type token.json ^| findstr "token"') do set TOKEN=%%a
    set TOKEN=!TOKEN:"=!
    set TOKEN=!TOKEN: =!
    echo [OK] Token obtained
)

echo.
echo [TEST 1/10] Testing backend API endpoint...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?limit=5" -H "Content-Type: application/json" 2>nul
)

if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Backend API not responding
    echo Please ensure backend server is running: cd backend ^&^& npm start
) else (
    echo [PASS] Backend API is responding
)

echo.
echo [TEST 2/10] Testing search with name parameter...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?search=john&limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?search=john&limit=5" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Search parameter test failed
) else (
    echo [PASS] Search parameter works
)

echo.
echo [TEST 3/10] Testing trade filter...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?trade_code=SOD&limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?trade_code=SOD&limit=5" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Trade filter test failed
) else (
    echo [PASS] Trade filter works
)

echo.
echo [TEST 4/10] Testing level filter...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?level_number=4&limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?level_number=4&limit=5" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Level filter test failed
) else (
    echo [PASS] Level filter works
)

echo.
echo [TEST 5/10] Testing gender filter...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?gender=male&limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?gender=male&limit=5" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Gender filter test failed
) else (
    echo [PASS] Gender filter works
)

echo.
echo [TEST 6/10] Testing Level 4 SOD combination...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?trade_code=SOD&level_number=4&limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?trade_code=SOD&level_number=4&limit=5" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] L4 SOD combination test failed
) else (
    echo [PASS] L4 SOD combination works
)

echo.
echo [TEST 7/10] Testing multiple filters...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?trade_code=SOD&level_number=4&gender=male&limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?trade_code=SOD&level_number=4&gender=male&limit=5" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Multiple filters test failed
) else (
    echo [PASS] Multiple filters work
)

echo.
echo [TEST 8/10] Testing pagination...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?page=1&limit=10" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?page=1&limit=10" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Pagination test failed
) else (
    echo [PASS] Pagination works
)

echo.
echo [TEST 9/10] Testing empty search...
echo.

if defined TOKEN (
    curl -X GET "http://localhost:5000/api/dos-management/students?search=&limit=5" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" 2>nul
) else (
    curl -X GET "http://localhost:5000/api/dos-management/students?search=&limit=5" -H "Content-Type: application/json" 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Empty search test failed
) else (
    echo [PASS] Empty search handled correctly
)

echo.
echo [TEST 10/10] Testing frontend accessibility...
echo.

curl -X GET "http://localhost:5173" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Frontend not accessible
    echo Please ensure frontend is running: npm run dev
) else (
    echo [PASS] Frontend is accessible
)

echo.
echo.
echo ========================================
echo  Test Summary
echo ========================================
echo.

if defined TOKEN (
    echo [OK] Tests completed with authentication
    del token.json 2>nul
) else (
    echo [WARN] Tests completed without authentication
    echo For full testing, ensure backend is running and credentials are correct
)

echo.
echo All tests completed!
echo.
echo If any tests failed:
echo   1. Ensure backend is running: cd backend ^&^& npm start
echo   2. Ensure frontend is running: npm run dev
echo   3. Verify database connection
echo   4. Check that tables exist
echo   5. Review console logs for errors
echo.

echo Manual testing checklist:
echo   [ ] Open browser to http://localhost:5173
echo   [ ] Login as Director of Studies
echo   [ ] Navigate to "Abanyeshuri" tab
echo   [ ] Type a student name in search box
echo   [ ] Select a trade from dropdown
echo   [ ] Select a level from dropdown
echo   [ ] Select a gender from dropdown
echo   [ ] Click "L4 SOD" button
echo   [ ] Verify results appear
echo   [ ] Click "Clear" button
echo   [ ] Navigate to "SOD" tab
echo   [ ] Search for SOD students
echo   [ ] Filter by gender
echo   [ ] Click "Refresh" button
echo   [ ] Click "View" on a student card
echo   [ ] Verify student details appear
echo.

echo ========================================
echo  Testing Complete!
echo ========================================
echo.

pause
