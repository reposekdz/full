@echo off
echo Forcing constraint removal...
echo.

mysql -u root -p123456 school_management -e "SET FOREIGN_KEY_CHECKS=0; ALTER TABLE parent_student_links DROP FOREIGN KEY parent_student_links_ibfk_2; SET FOREIGN_KEY_CHECKS=1; SELECT 'Constraint removed!' AS Status;"

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Constraint removed.
    echo Now restart your backend server.
) else (
    echo.
    echo ❌ MySQL command not found. Using Node.js...
    cd backend
    node -e "const mysql=require('mysql2/promise');(async()=>{const c=await mysql.createConnection({host:'localhost',user:'root',password:'123456',database:'school_management'});await c.query('SET FOREIGN_KEY_CHECKS=0');await c.query('ALTER TABLE parent_student_links DROP FOREIGN KEY parent_student_links_ibfk_2');await c.query('SET FOREIGN_KEY_CHECKS=1');console.log('✅ Constraint removed!');await c.end();})().catch(e=>{console.error('Error:',e.message);process.exit(1)});"
)

echo.
pause
