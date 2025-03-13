#!/bin/bash

# Change to the application directory
cd "$(dirname "$0")"

# Stop ngrok if running
if [ -f ./logs/ngrok.pid ]; then
  echo "Stopping ngrok tunnel..."
  NGROK_PID=$(cat ./logs/ngrok.pid)
  kill $NGROK_PID 2>/dev/null || true
  rm ./logs/ngrok.pid
else
  echo "No ngrok PID file found"
fi

# Stop the application with PM2
echo "Stopping Social Media Tool with PM2..."
pm2 stop social-media-tool

echo "Service stopped successfully!" 