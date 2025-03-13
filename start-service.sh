#!/bin/bash

# Change to the application directory
cd "$(dirname "$0")"

# Start the application with PM2 if not already running
pm2 describe social-media-tool > /dev/null
if [ $? -ne 0 ]; then
  echo "Starting Social Media Tool with PM2..."
  pm2 start ecosystem.config.js
else
  echo "Social Media Tool is already running with PM2"
fi

# Start ngrok in the background
echo "Starting ngrok tunnel..."
nohup ngrok http 3000 --log=stdout > ./logs/ngrok.log 2>&1 &

# Save the ngrok PID
echo $! > ./logs/ngrok.pid

echo "Service started successfully!"
echo "To view the ngrok URL, run: cat ./logs/ngrok.log | grep -o 'url=https://.*' | cut -d= -f2"
echo "To stop the service, run: ./stop-service.sh" 