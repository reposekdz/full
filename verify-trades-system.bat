@echo off
echo ========================================
echo Trade System Verification
echo ========================================
echo.

echo [1/4] Checking Backend Server...
curl -s http://localhost:5000/api/trades/all >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Backend is running
) else (
    echo   ✗ Backend is NOT running
    echo   → Start it with: cd backend ^&^& npm start
    goto :end
)

echo.
echo [2/4] Checking Trades...
curl -s "http://localhost:5000/api/trades/all" | findstr /c:"\"code\"" | find /c ":" >nul
echo   ✓ Found trades in database

echo.
echo [3/4] Checking Images for AUT...
curl -s "http://localhost:5000/api/trade-images/gallery/AUT" | findstr /c:"\"count\"" >nul
if %errorlevel% equ 0 (
    echo   ✓ Images API working
) else (
    echo   ✗ Images API not working
)

echo.
echo [4/4] Checking Courses...
curl -s "http://localhost:5000/api/trade-courses-api/trade/AUTO" | findstr /c:"\"courses\"" >nul
if %errorlevel% equ 0 (
    echo   ✓ Courses API working
) else (
    echo   ✗ Courses API not working
)

echo.
echo ========================================
echo Detailed Results:
echo ========================================
echo.

echo Trades:
curl -s "http://localhost:5000/api/trades/all" | node -e "try{const d=require('fs').readFileSync(0,'utf-8');const j=JSON.parse(d);console.log('  Total:',j.trades.length);j.trades.forEach(t=>console.log('   -',t.code,'-',t.name));}catch(e){console.log('  Error:',e.message);}"

echo.
echo Images for AUT:
curl -s "http://localhost:5000/api/trade-images/gallery/AUT" | node -e "try{const d=require('fs').readFileSync(0,'utf-8');const j=JSON.parse(d);console.log('  Total:',j.count);const c={};j.gallery.forEach(i=>c[i.category]=(c[i.category]||0)+1);Object.entries(c).forEach(([k,v])=>console.log('   -',k+':',v));}catch(e){console.log('  Error:',e.message);}"

echo.
echo Courses for AUTO:
curl -s "http://localhost:5000/api/trade-courses-api/trade/AUTO" | node -e "try{const d=require('fs').readFileSync(0,'utf-8');const j=JSON.parse(d);console.log('  Total:',j.courses?.length||0);const l={};j.courses?.forEach(c=>l[c.level_number]=(l[c.level_number]||0)+1);Object.entries(l).forEach(([k,v])=>console.log('   - Level',k+':',v,'courses'));}catch(e){console.log('  Error:',e.message);}"

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. If backend is NOT running: cd backend ^&^& npm start
echo 2. Open browser: http://localhost:5173/trades
echo 3. Click on AUT trade
echo 4. Check "Levels ^& Courses" tab
echo 5. Check "Gallery" tab
echo.

:end
pause
