#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up development environment...${NC}"

# Setup Server
echo -e "${BLUE}Setting up server...${NC}"
cd server
rm -rf node_modules package-lock.json
npm install
cd ..

# Setup Client
echo -e "${BLUE}Setting up client...${NC}"
cd client
rm -rf node_modules package-lock.json
npm install
cd ..

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}To start the development servers:${NC}"
echo -e "Terminal 1: ${GREEN}cd server && npm run dev${NC}"
echo -e "Terminal 2: ${GREEN}cd client && npm run dev${NC}" 