#!/bin/bash

# Portfolio Risk Analyzer & Simulation Engine
# One-click start script

echo "============================================="
echo " Starting Portfolio Risk Analyzer "
echo "============================================="
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT SIGTERM

# 1. Start the Backend
echo "-> Checking Backend..."
cd backend

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating python virtual environment..."
    python3 -m venv venv
fi

# Activate venv and install dependencies if needed
source venv/bin/activate

# Assuming basic dependencies are installed as we already ran it locally, 
# but a user cloning it will need to install them.
# We don't have a requirements.txt yet, so let's quickly install them just in case or ensure pip install is easy.
if [ ! -f "requirements.txt" ]; then
    pip freeze > requirements.txt
fi
pip install -r requirements.txt > /dev/null 2>&1

echo "-> Starting Backend (FastAPI)..."
uvicorn main:app --port 8000 > backend_log.txt 2>&1 &
BACKEND_PID=$!
cd ..

# 2. Start the Frontend
echo "-> Checking Frontend..."
cd frontend

# Install node_modules if they don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing node modules..."
    npm install > /dev/null 2>&1
fi

echo "-> Starting Frontend (Next.js)..."
npm run dev > frontend_log.txt 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================="
echo " Application is Live! "
echo "============================================="
echo " UI / Frontend : http://localhost:3000 "
echo " API Backend   : http://localhost:8000 "
echo "============================================="
echo "Press Ctrl+C to stop both servers."

# Wait indefinitely until interrupted
wait
