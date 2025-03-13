#!/bin/bash

# Change to the application directory
cd "$(dirname "$0")"

# Check PM2 status
echo "=== PM2 Status ==="
pm2 describe social-media-tool
echo ""

# Check ngrok status
echo "=== ngrok Status ==="
if [ -f ./logs/ngrok.pid ]; then
  NGROK_PID=$(cat ./logs/ngrok.pid)
  if ps -p $NGROK_PID > /dev/null; then
    echo "ngrok is running with PID $NGROK_PID"
    echo "Current ngrok URL:"
    cat ./logs/ngrok.log | grep -o 'url=https://.*' | tail -1 | cut -d= -f2
  else
    echo "ngrok process with PID $NGROK_PID is not running"
  fi
else
  echo "No ngrok PID file found"
fi 