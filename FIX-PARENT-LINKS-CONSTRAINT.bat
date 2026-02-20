@echo off
echo ========================================
echo FIX PARENT LINKS CONSTRAINT
echo ========================================
echo.

cd /d "%~dp0backend"

echo Running SQL fix...
node -e "const mysql=require('mysql2/promise');(async()=>{const c=await mysql.createConnection({host:'localhost',user:'root',password:'123456',database:'school_management',multipleStatements:true});const sql=require('fs').readFileSync('fix-parent-links-constraint.sql','utf8');await c.query(sql);console.log('✅ Constraint fixed!');await c.end();})().catch(e=>{console.error('❌ Error:',e.message);process.exit(1)});"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Fix failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ PARENT LINKS FIXED!
echo ========================================
echo.
echo The foreign key constraint has been removed.
echo Now student_id can reference global_student_sheets.id
echo.
pause
