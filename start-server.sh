#!/bin/bash
# Simple script to start a local HTTP server

cd "$(dirname "$0")"  # Change to the directory where this script is located

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "Starting server with Python 3..."
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &>/dev/null; then
    echo "Starting server with Python 2..."
    python -m SimpleHTTPServer 8000
else
    echo "Error: Python is not installed. Please install Python to use this script."
    exit 1
fi
