@echo off
echo ========================================
echo DOD SMS SYSTEM - RUNNING MIGRATION
echo ========================================
echo.

node run-dod-migration.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo NEXT STEPS:
    echo ========================================
    echo.
    echo 1. Start the server:
    echo    npm run dev
    echo.
    echo 2. Login as DOD/Matron/Patron
    echo.
    echo 3. Test features:
    echo    - Remove conduct (auto SMS)
    echo    - Mark student sick (auto SMS)
    echo    - Grant leave (auto SMS)
    echo    - Message parents
    echo.
    echo 4. Check documentation:
    echo    DOD_SMS_SYSTEM_COMPLETE.md
    echo.
)

pause
