#!/bin/bash
# Bowman Insurance Backend Setup Script for Linux/macOS
# This script automates the initial setup of the Django backend

set -e  # Exit on error

echo "================================"
echo "Bowman Insurance Backend Setup"
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.11+ from https://www.python.org/downloads/"
    exit 1
fi

echo "[1/8] Python found"
python3 --version
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "[2/8] Virtual environment already exists"
else
    echo "[2/8] Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created successfully"
fi
echo ""

# Activate virtual environment
echo "[3/8] Activating virtual environment..."
source venv/bin/activate
echo ""

# Upgrade pip
echo "[4/8] Upgrading pip..."
pip install --upgrade pip
echo ""

# Install dependencies
echo "[5/8] Installing Python dependencies..."
echo "This may take a few minutes..."
pip install -r requirements.txt
echo "Dependencies installed successfully"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "[6/8] .env file already exists"
else
    echo "[6/8] Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "[IMPORTANT] Please edit the .env file with your database credentials"
    echo "Edit .env file now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        ${EDITOR:-nano} .env
    fi
fi
echo ""

# Create migrations
echo "[7/8] Creating database migrations..."
if python manage.py makemigrations; then
    echo "Migrations created successfully"
else
    echo "[WARNING] Failed to create migrations"
    echo "This is normal if database is not configured yet"
    echo "Please configure your database in .env and run: python manage.py makemigrations"
fi
echo ""

# Run migrations
echo "[8/8] Running migrations..."
if python manage.py migrate; then
    echo "Migrations applied successfully"
else
    echo "[WARNING] Failed to run migrations"
    echo "Please ensure:"
    echo "  1. PostgreSQL is installed and running"
    echo "  2. Database credentials in .env are correct"
    echo "  3. Database exists (run: CREATE DATABASE bowman_insurance;)"
    echo ""
    echo "To complete setup later, run:"
    echo "  python manage.py migrate"
    echo "  python manage.py createsuperuser"
fi
echo ""

echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. If migrations failed, configure database in .env"
echo "  2. Create superuser: python manage.py createsuperuser"
echo "  3. Run server: python manage.py runserver"
echo "  4. Access API docs: http://localhost:8000/api/docs/"
echo "  5. Access admin: http://localhost:8000/admin/"
echo ""
echo "To activate virtual environment in the future:"
echo "  source venv/bin/activate"
echo ""
