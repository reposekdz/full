@echo off
echo ========================================
echo PARENT-CHILD LINKING SAFE MIGRATION
echo ========================================
echo.

cd backend

echo [1/2] Running safe migration...
node run-parent-linking-migration.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Migration failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Verifying installation...
node -e "const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'school_management' }); const [tables] = await conn.execute('SHOW TABLES LIKE \"parent_%%\"'); console.log('✅ Tables found:', tables.length); await conn.end(); })()"

echo.
echo ========================================
echo MIGRATION COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Restart backend: npm start
echo 2. Use component: GlobalSheetsParentLinkingIntegration
echo 3. API: /api/parent-child-linking-advanced/*
echo.
pause
