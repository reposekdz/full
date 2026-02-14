@echo off

REM Set working directory to script location
cd /d "%~dp0"

REM Run the DOD and DOS tables migration
REM Make sure MySQL is in your PATH or run this from MySQL bin directory

echo Running DOD and DOS migration...
mysql -u root -proot school_management < migrations/dos-dod-tables.sql

echo Migration completed!
pause
