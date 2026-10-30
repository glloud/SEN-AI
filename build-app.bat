@echo off
title SEN AI Desktop - Windows 11 Setup Builder
echo ========================================================
echo         SEN AI Desktop - Windows 11 App Packager
echo ========================================================
echo.

echo [Step 1/3] Verifying and installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error during npm install. Please ensure Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 2/3] Building UI and bundled backend engine...
call npm run build
call npx esbuild server.ts --bundle --platform=node --format=cjs --outfile=server.js --external:electron
if %ERRORLEVEL% NEQ 0 (
    echo Error bundling server.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 3/3] Generating Windows 11 standalone setup executable (.exe)...
call npx electron-builder --win --x64
if %ERRORLEVEL% NEQ 0 (
    echo Error during packaging.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo  BUILD COMPLETE!
echo  Your standalone Windows 11 installer is located at:
echo  dist-electron\SEN AI Desktop Setup 1.0.0.exe
echo ========================================================
pause
