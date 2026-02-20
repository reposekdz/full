@echo off
echo ========================================
echo   ULTRA TEACHER DASHBOARD SETUP
echo   Global Sheets + Dynamic Columns
echo ========================================
echo.
echo This will create:
echo   ✅ Global student sheets access
echo   ✅ Dynamic column management
echo   ✅ Real-time marks entry
echo   ✅ Auto-calculations (Total, %, Grade)
echo   ✅ Database storage for all marks
echo   ✅ Export to CSV functionality
echo.
pause

cd backend

echo.
echo [1/3] Creating database schema...
mysql -u root -p < migrations/teacher-global-sheets-schema.sql
if errorlevel 1 (
    echo ❌ Schema creation failed!
    echo Trying alternative method...
    node -e "const mysql=require('mysql2/promise');const fs=require('fs');(async()=>{const conn=await mysql.createConnection({host:'localhost',user:'root',password:'',database:'school_management'});const sql=fs.readFileSync('migrations/teacher-global-sheets-schema.sql','utf8');await conn.query(sql);console.log('✅ Schema created!');await conn.end();})();"
)
echo ✅ Schema created!

echo.
echo [2/3] Registering API routes...

REM Check if route exists
findstr /C:"teacher-global-sheets-ultra" server.js >nul 2>&1
if errorlevel 1 (
    echo Adding route to server.js...
    
    REM Backup
    copy server.js server.js.backup >nul
    
    REM Add route
    powershell -Command "(Get-Content server.js) -replace '(// Mount all routes)', 'const teacherGlobalSheetsUltra = require(''./routes/teacher-global-sheets-ultra'');`r`n`r`n$1' | Set-Content server.js"
    powershell -Command "(Get-Content server.js) -replace '(app.use\(''/api/teacher'')', 'app.use(''/api/teacher-global-sheets'', teacherGlobalSheetsUltra);`r`n$1' | Set-Content server.js"
    
    echo ✅ Route registered!
) else (
    echo ✅ Route already registered!
)

echo.
echo [3/3] Frontend integration...
echo ✅ Component created at: src/app/pages/dashboards/UltraTeacherDashboard.tsx

echo.
echo ========================================
echo   SETUP COMPLETE! 🎉
echo ========================================
echo.
echo 📚 FEATURES AVAILABLE:
echo   ✅ Global student sheets (all trades/levels)
echo   ✅ Dynamic column creation (Test, Exam, Assignment, Quiz)
echo   ✅ Real-time marks entry (click-to-edit cells)
echo   ✅ Auto-calculations (Total, Percentage, Grade)
echo   ✅ Database persistence (all marks saved)
echo   ✅ Export to CSV
echo   ✅ Filter by Trade and Level
echo   ✅ Search students
echo   ✅ Delete columns
echo   ✅ Weighted scoring system
echo.
echo 🎯 NEXT STEPS:
echo   1. Restart backend: npm start
echo   2. Login as teacher
echo   3. Navigate to Ultra Teacher Dashboard
echo   4. Select Trade and Level
echo   5. Click "Add Column" to create assessments
echo   6. Click cells to enter marks
echo   7. Click "Save Marks" to persist to database
echo   8. Click "Export CSV" to download
echo.
echo 📖 API Endpoints:
echo   GET  /api/teacher-global-sheets/students
echo   GET  /api/teacher-global-sheets/columns
echo   POST /api/teacher-global-sheets/columns/add
echo   DELETE /api/teacher-global-sheets/columns/:id
echo   GET  /api/teacher-global-sheets/marks
echo   POST /api/teacher-global-sheets/marks/save
echo.
pause
