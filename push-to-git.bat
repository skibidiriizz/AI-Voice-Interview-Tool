@echo off
echo 🚀 AI Voice Interview Tool - Git Push Script 🚀
echo.

REM Check if repository URL is provided
if "%1"=="" (
    echo ❌ Error: Please provide repository URL as argument
    echo Usage: push-to-git.bat https://github.com/yourusername/AI-Voice-Interview-Tool.git
    pause
    exit /b 1
)

set REPO_URL=%1

echo 📡 Adding remote repository...
git remote add origin %REPO_URL%

echo 📤 Pushing to repository...
git push -u origin master

if %ERRORLEVEL%==0 (
    echo.
    echo ✅ SUCCESS! Your AI Voice Interview Tool has been pushed to Git!
    echo 🌐 Repository: %REPO_URL%
    echo.
    echo 📋 What was pushed:
    echo   ✅ Complete FastAPI backend
    echo   ✅ Next.js React frontend
    echo   ✅ All components and features
    echo   ✅ Documentation and setup files
    echo   ✅ Docker configuration
    echo   ✅ Environment setup
    echo.
    echo 🎯 Your project is now available online!
) else (
    echo.
    echo ❌ Error occurred during push. Please check:
    echo   - Repository URL is correct
    echo   - You have write access to the repository
    echo   - Repository is empty (no README or other files)
    echo.
)

pause