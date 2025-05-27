#!/bin/bash

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2..."
    sudo npm install -g pm2
fi

# Kill any existing instance of our server
pm2 delete vets-claims-server 2>/dev/null || true

# Start the server with PM2
pm2 start server.js --name vets-claims-server

# Save the PM2 process list
pm2 save

# Display the status
pm2 status

echo "Server is now running in the background with PM2."
echo "Use 'pm2 status' to check server status"
echo "Use 'pm2 logs vets-claims-server' to view server logs"
echo "Use 'pm2 stop vets-claims-server' to stop the server"
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
