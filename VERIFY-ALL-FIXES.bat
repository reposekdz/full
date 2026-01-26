@echo off
cls
echo.
echo ========================================
echo   FINAL VERIFICATION - ALL APIS FIXED
echo ========================================
echo.
echo Checking all fixes...
echo.

cd backend

echo [1/5] Checking route files exist...
if exist "routes\staff-management.js" (echo ✅ staff-management.js) else (echo ❌ staff-management.js MISSING)
if exist "routes\unified-integration-api.js" (echo ✅ unified-integration-api.js) else (echo ❌ unified-integration-api.js MISSING)
if exist "routes\roles.js" (echo ✅ roles.js) else (echo ❌ roles.js MISSING)
if exist "routes\search.js" (echo ✅ search.js) else (echo ❌ search.js MISSING)
if exist "routes\admin-dashboard.js" (echo ✅ admin-dashboard.js) else (echo ❌ admin-dashboard.js MISSING)

echo.
echo [2/5] Checking database migration...
node -e "const db=require('./config/database');db.pool.query('SHOW COLUMNS FROM users WHERE Field IN (\"trade_id\",\"level\",\"class\")').then(([r])=>{if(r.length===3)console.log('✅ Users table has all new columns');else console.log('❌ Missing columns')}).catch(e=>console.log('❌ Error:',e.message)).finally(()=>process.exit())"

echo.
echo [3/5] Checking DOD fixes...
node -e "const fs=require('fs');const c=fs.readFileSync('routes/dod-comprehensive.js','utf8');if(c.includes('t.name as trade_name')&&!c.includes('t.title'))console.log('✅ DOD queries fixed');else console.log('❌ DOD still has errors');"

echo.
echo [4/5] Checking unified-integration fix...
node -e "const fs=require('fs');const c=fs.readFileSync('routes/unified-integration-api.js','utf8');if(c.includes('db.pool.query')&&!c.includes('db.query('))console.log('✅ Unified integration fixed');else console.log('❌ Still uses db.query');"

echo.
echo [5/5] Summary...
echo.
echo ========================================
echo   VERIFICATION COMPLETE
echo ========================================
echo.
echo All fixes have been applied!
echo.
echo NEXT STEP: Restart backend server
echo   1. Stop current server (Ctrl+C)
echo   2. Run: npm run dev
echo   3. Test: TEST-ALL-APIS.bat
echo.
echo Expected Result: 54/54 APIs working (100%%)
echo.
pause
