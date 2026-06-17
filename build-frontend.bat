@echo off
echo ===================================================
echo Building React Vite Frontend and copying to wwwroot
echo ===================================================

cd erp-frontend\vite
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Cleaning old wwwroot files...
if exist "..\..\ERPSystem.API\wwwroot" (
    rd /s /q "..\..\ERPSystem.API\wwwroot"
)
mkdir "..\..\ERPSystem.API\wwwroot"

echo.
echo Copying new build assets to ERPSystem.API/wwwroot...
xcopy /s /e /y "dist\*" "..\..\ERPSystem.API\wwwroot\"

echo.
echo ===================================================
echo SUCCESS: Frontend files successfully moved to wwwroot!
echo Now you can push to git or publish from Visual Studio.
echo ===================================================
pause
