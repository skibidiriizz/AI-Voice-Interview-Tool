@echo off
echo Starting AI Voice Interview Tool...

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please copy .env.example to .env and configure your OpenAI API key
    pause
    exit /b 1
)

echo Starting backend server...
start cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this script (servers will continue running)
pause >nul