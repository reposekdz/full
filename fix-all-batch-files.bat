@echo off
cd /d "%~dp0"

echo ========================================
echo  Fixing All Batch Files
echo ========================================
echo.

setlocal enabledelayedexpansion

for %%f in (setup-*.bat ensure-*.bat run-*.bat) do (
    if exist "%%f" (
        findstr /C:"cd /d" "%%f" >nul
        if errorlevel 1 (
            echo Fixing: %%f
            
            REM Create temp file with fix
            (
                echo @echo off
                echo.
                echo REM Set working directory to script location
                echo cd /d "%%~dp0"
                echo.
                type "%%f" | findstr /V "@echo off"
            ) > "%%f.tmp"
            
            REM Replace original
            move /Y "%%f.tmp" "%%f" >nul
        )
    )
)

echo.
echo ========================================
echo  Done! All batch files fixed.
echo ========================================
echo.
pause
