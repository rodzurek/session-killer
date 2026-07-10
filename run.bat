@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo  Session Killer - Incident Response Checklist
echo ================================================
echo.

:: Install dependencies on first run
if not exist "node_modules" (
    echo [setup] Installing dependencies - this only happens once...
    call npm install
    if errorlevel 1 ( echo. & echo ERROR: npm install failed & pause & exit /b 1 )
    echo.
)

:: Always reset DB with a clean seed BEFORE building
:: (build pre-renders with DB data, so seed must run first)
echo [db] Resetting database...
call npx prisma db push --force-reset --skip-generate
call npx tsx prisma/seed.ts
echo.

:: Build with webpack - once per location (Prisma client hash is path-dependent)
set NEED_BUILD=1
if exist ".next\built-with-webpack" (
    set /p STORED_PATH=<".next\built-with-webpack"
    if "!STORED_PATH!"=="%~dp0" set NEED_BUILD=0
)

if !NEED_BUILD!==1 (
    echo [setup] Building app for this location - this only happens once...
    if exist ".next" rmdir /s /q ".next"
    call npx prisma generate
    call npm run build
    if errorlevel 1 ( echo. & echo ERROR: build failed & pause & exit /b 1 )
    echo %~dp0>".next\built-with-webpack"
    echo.
)

echo  Open http://localhost:3000 in your browser
echo  Press Ctrl+C to stop the server.
echo.

call npm start
