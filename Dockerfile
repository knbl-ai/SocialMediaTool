# Build stage for React client
FROM --platform=linux/amd64 node:20-slim as client-builder
WORKDIR /app/client

# Copy both package files and env files
COPY client/package*.json ./
COPY client/.env* ./

# Build arguments for client environment variables
ARG VITE_API_URL
ARG NODE_ENV=production

# Install ALL dependencies (including dev dependencies)
RUN npm install --include=dev

# Copy client source
COPY client/ ./

# Build the app using npx
RUN npx vite build

# Production stage
FROM --platform=linux/amd64 node:20-slim
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./

# Copy built client files
COPY --from=client-builder /app/client/dist ./public

# Add node environment variables
ENV NODE_ENV=production
ENV PORT=8080

# The user ID that Cloud Run will run the container as
USER node

EXPOSE 8080
CMD ["node", "index.js"] 