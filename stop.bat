@echo off
title HuggingFace Summarization Platform - Shutdown

echo Stopping HuggingFace Summarization Platform...
echo.

:: Check if Docker Compose is installed
WHERE docker-compose >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Docker Compose is not installed. Cannot stop services.
    goto :end
)

:: Ask user if they want to keep data
set /p REMOVE_DATA="Do you want to remove all data (MongoDB volume)? (y/N): "

IF /I "%REMOVE_DATA%"=="y" (
    echo Stopping containers and removing volumes...
    docker-compose down -v
    echo All containers and volumes have been removed.
) ELSE (
    echo Stopping containers but keeping data volumes...
    docker-compose down
    echo All containers have been stopped. Data volumes are preserved.
)

echo.
echo Cleanup complete!

:end
pause 