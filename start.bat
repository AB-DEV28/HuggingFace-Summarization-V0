@echo off
title HuggingFace Summarization Platform

echo =========================
echo HuggingFace Summarization
echo =========================
echo.

echo Starting HuggingFace Summarization Platform...
echo.

:: Check if Docker is installed
WHERE docker >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed. Please install Docker first.
    goto :end
)

:: Check if Docker is running
docker info >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    goto :end
)

:: Check if Docker Compose is installed
WHERE docker-compose >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker Compose is not installed. Please install Docker Compose first.
    goto :end
)

:: Check if .env file exists in backend directory
IF NOT EXIST .\backend\.env (
    echo WARNING: No .env file found in backend directory.
    echo Creating a sample .env file...
    
    :: Create a sample .env file
    (
        echo # Please replace with your actual values
        echo MONGO_URI=mongodb://admin:adminpassword@mongo:27017/textsummarization?authSource=admin
        echo HF_TOKEN=your_huggingface_token
        echo SECRET_KEY=sample_secret_key_replace_this
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo DB_NAME=textsummarization
        echo ENVIRONMENT=development
        echo HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/facebook/bart-large-cnn
    ) > .\backend\.env
    
    echo Sample .env file created in backend directory.
    echo.
    echo IMPORTANT: You must edit this file with your actual HuggingFace API token!
    echo Press Enter to continue or Ctrl+C to exit and update the .env file...
    pause
)

:: Clean up any existing containers first
echo Cleaning up any existing containers...
docker-compose down --remove-orphans

:: Start the application with docker-compose
echo Building and starting services...
echo This may take several minutes the first time it runs...
echo.
docker-compose up -d --build

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: There was a problem starting the application.
    echo Check the error messages above for more details.
    goto :end
)

:: Wait for services to be ready
echo.
echo Waiting for services to be ready...
timeout /t 30 /nobreak > nul

:: Display status of containers
echo.
echo Current container status:
docker-compose ps
echo.

echo If the STATUS column shows "Up", the services are running.
echo.
echo Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000
echo    - API Documentation: http://localhost:8000/docs
echo.
echo Useful commands:
echo    - View logs: docker-compose logs -f
echo    - Stop application: docker-compose down
echo    - View container status: docker-compose ps
echo.

:end
pause 