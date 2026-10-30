@echo off
title SEN AI Desktop - Windows 11 Packager & Launcher
echo ========================================================
echo         SEN AI Desktop - Windows 11 App Packager
echo ========================================================
echo.

echo [Step 1/3] Verifying dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to run npm install. Ensure Node.js is installed on your PC.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 2/3] Building UI and bundled backend engine...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vite build failed.
    pause
    exit /b %ERRORLEVEL%
)

call npx esbuild server.ts --bundle --platform=node --format=cjs --outfile=server.js --external:electron
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to bundle backend server.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 3/3] Packaging Windows 11 Executables (Portable + Setup)...
call npx electron-builder --win --x64
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Packaging failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo                  BUILD SUCCESSFUL!
echo ========================================================
echo.
echo Two Windows 11 binaries have been generated in dist-electron:
echo.
echo 1) PLUG & PLAY PORTABLE (RECOMMENDED - Instant Run, No Install):
echo    dist-electron\SEN AI Desktop Portable.exe
echo    * Double-click to run immediately without any installer!
echo    * Zero shortcut errors, runs standalone on any Windows 11 PC.
echo.
echo 2) FULL WINDOWS 11 INSTALLER:
echo    dist-electron\SEN AI Desktop Setup 1.0.0.exe
echo    * Standard wizard setup with validated Start Menu & Desktop shortcuts.
echo.
echo ========================================================
pause
