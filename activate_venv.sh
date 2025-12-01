#!/bin/bash
# Activate virtual environment helper script
# Usage: source activate_venv.sh

echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

echo "✅ Virtual environment activated!"
echo ""
echo "📦 Installed packages:"
pip list | grep -E "fastapi|uvicorn|sqlalchemy|pymysql|requests|pytest"
echo ""
echo "💡 To deactivate, run: deactivate"
