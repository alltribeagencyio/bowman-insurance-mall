@echo off
REM Bowman Insurance Backend Setup Script for Windows
REM This script automates the initial setup of the Django backend

echo ================================
echo Bowman Insurance Backend Setup
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [1/8] Python found
python --version
echo.

REM Check if virtual environment exists
if exist "venv\" (
    echo [2/8] Virtual environment already exists
) else (
    echo [2/8] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully
)
echo.

REM Activate virtual environment
echo [3/8] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo.

REM Upgrade pip
echo [4/8] Upgrading pip...
python -m pip install --upgrade pip
echo.

REM Install dependencies
echo [5/8] Installing Python dependencies...
echo This may take a few minutes...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

REM Check if .env exists
if exist ".env" (
    echo [6/8] .env file already exists
) else (
    echo [6/8] Creating .env file from template...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Please edit the .env file with your database credentials
    echo Press any key to open .env file in notepad...
    pause
    notepad .env
)
echo.

REM Create migrations
echo [7/8] Creating database migrations...
python manage.py makemigrations
if errorlevel 1 (
    echo [WARNING] Failed to create migrations
    echo This is normal if database is not configured yet
    echo Please configure your database in .env and run: python manage.py makemigrations
)
echo.

echo [8/8] Running migrations...
python manage.py migrate
if errorlevel 1 (
    echo [WARNING] Failed to run migrations
    echo Please ensure:
    echo   1. PostgreSQL is installed and running
    echo   2. Database credentials in .env are correct
    echo   3. Database exists (run: CREATE DATABASE bowman_insurance;)
    echo.
    echo To complete setup later, run:
    echo   python manage.py migrate
    echo   python manage.py createsuperuser
)
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo   1. If migrations failed, configure database in .env
echo   2. Create superuser: python manage.py createsuperuser
echo   3. Run server: python manage.py runserver
echo   4. Access API docs: http://localhost:8000/api/docs/
echo   5. Access admin: http://localhost:8000/admin/
echo.
echo To activate virtual environment in the future:
echo   venv\Scripts\activate.bat
echo.
pause
