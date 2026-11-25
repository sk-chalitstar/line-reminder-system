@echo off
cd /d "%~dp0"

echo =======================================================
echo   Uploading LINE Reminder System to GitHub...
echo =======================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not found in PATH!
    echo.
    echo Please install Git for Windows:
    echo 1. Download Git from: https://git-scm.com/download/win
    echo 2. Run the installer (click Next until finished)
    echo 3. Run this push-to-github.bat file again!
    echo.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init

echo [2/5] Setting up user info...
git config user.name "sk-chalitstar"
git config user.email "sk-chalitstar@users.noreply.github.com"

echo [3/5] Staging files...
git add .
git commit -m "feat: initial commit for Smart LINE Reminder System"

echo [4/5] Connecting to GitHub repository...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/sk-chalitstar/line-reminder-system.git

echo [5/5] Pushing to GitHub (sk-chalitstar/line-reminder-system)...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo =======================================================
    echo   SUCCESS! Uploaded to GitHub successfully!
    echo   View your repository at:
    echo   https://github.com/sk-chalitstar/line-reminder-system
    echo =======================================================
) else (
    echo =======================================================
    echo   NOTE: If a GitHub login window popped up in your
    echo   browser, please click "Authorize" or sign in.
    echo =======================================================
)

echo.
pause
