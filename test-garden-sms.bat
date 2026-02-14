@echo off
echo ========================================
echo GARDEN TVET SCHOOL - SMS SYSTEM TEST
echo ========================================
echo.
echo This will test automatic SMS notifications for:
echo - Conduct Removal by DOD/Patron/Matron
echo - Leave Approval
echo - Health Emergency
echo.
echo Messages will be sent to: 0780467323
echo.
pause

cd backend
node test-garden-sms.js

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo Check phone 0780467323 for messages!
echo.
pause
