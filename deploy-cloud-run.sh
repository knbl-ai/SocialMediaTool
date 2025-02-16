#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="smapp-446219"
REGION="us-central1"
SERVICE_NAME="social-media-tool"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to read env file and format for Cloud Run
format_env_vars() {
    local env_file=$1
    local vars=""
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        
        # Trim whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        
        # Skip if key is empty after trim
        [[ -z "$key" ]] && continue
        
        # Escape special characters in value
        value=$(echo "$value" | sed 's/"/\\"/g')
        
        # Append to vars string
        if [ -z "$vars" ]; then
            vars="${key}=${value}"
        else
            vars="${vars},${key}=${value}"
        fi
    done < "$env_file"
    echo "$vars"
}

# Check for required commands
echo -e "${BLUE}Checking required commands...${NC}"
for cmd in gcloud docker; do
    if ! command_exists "$cmd"; then
        echo -e "${RED}Error: ${cmd} is not installed${NC}"
        exit 1
    fi
done

# Check for .env file
if [ ! -f "server/.env" ]; then
    echo -e "${RED}Error: server/.env file not found${NC}"
    exit 1
fi

# Configure gcloud
echo -e "${BLUE}Configuring gcloud...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${BLUE}Enabling required APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com

# Configure Docker for GCR
echo -e "${BLUE}Configuring Docker for Google Container Registry...${NC}"
gcloud auth configure-docker

# Format environment variables
ENV_VARS=$(format_env_vars "server/.env")

# Add required environment variables (removed PORT as it's reserved)
ENV_VARS="${ENV_VARS},NODE_ENV=production,CLIENT_URL=https://igentity.ai"

# Build the container
echo -e "${BLUE}Building container...${NC}"
docker build \
    --platform linux/amd64 \
    -t ${IMAGE_NAME} \
    --build-arg VITE_API_URL="https://igentity.ai" \
    .

# Push to Container Registry
echo -e "${BLUE}Pushing to Container Registry...${NC}"
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo -e "${BLUE}Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars="${ENV_VARS}" \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10

# Set up custom domain mapping
echo -e "${BLUE}Setting up custom domain mapping...${NC}"
gcloud beta run domain-mappings create \
    --service=${SERVICE_NAME} \
    --domain=igentity.ai \
    --region=${REGION} \
    --platform=managed

# Wait for domain mapping to be ready
echo -e "${BLUE}Waiting for domain mapping to be ready...${NC}"
sleep 30  # Give time for the domain mapping to propagate

# Verify domain mapping
echo -e "${BLUE}Verifying domain mapping...${NC}"
gcloud beta run domain-mappings describe \
    --domain=igentity.ai \
    --region=${REGION} \
    --platform=managed

# Get the service URL
SERVICE_URL="https://igentity.ai"

# Update environment variables with the actual service URL
ENV_VARS="${ENV_VARS},CLIENT_URL=${SERVICE_URL}"

# Update the service with the new environment variables
echo -e "${BLUE}Updating service with client URL...${NC}"
gcloud run services update ${SERVICE_NAME} \
    --platform managed \
    --region ${REGION} \
    --set-env-vars="${ENV_VARS}"

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Service URL: ${SERVICE_URL}"
echo -e "\nTo view logs:"
echo -e "${BLUE}gcloud logs tail --project=${PROJECT_ID} --service=${SERVICE_NAME}${NC}"

# Print environment variables that were set
echo -e "\n${BLUE}Environment variables set:${NC}"
gcloud run services describe ${SERVICE_NAME} \
    --platform managed \
    --region ${REGION} \
    --format 'value(spec.template.spec.containers[0].env[])' 