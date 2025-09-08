@echo off
setlocal ENABLEDELAYEDEXPANSION

cd /d "%~dp0"

echo === Capacitor Android build (duplicate assets fix) ===

where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo Running: npm run build:android
  call npm run build:android
  set EXITCODE=%ERRORLEVEL%
  goto :end
)

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo npm not found. Falling back to Node directly...
  echo Running: node scripts\build-android-cap.mjs
  node scripts\build-android-cap.mjs
  set EXITCODE=%ERRORLEVEL%
  goto :end
)

echo Error: Neither npm nor node found in PATH.
set EXITCODE=1

:end
if not "%EXITCODE%"=="0" (
  echo Build failed with exit code %EXITCODE%.
) else (
  echo Build completed successfully.
)
exit /b %EXITCODE%

