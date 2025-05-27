#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Setting up Netlify environment variables...${NC}"

# Function to prompt for variable
get_variable() {
    local var_name=$1
    local description=$2
    local default=$3
    
    echo -e "${GREEN}${description}${NC}"
    if [ -n "$default" ]; then
        echo -n "Enter $var_name (default: $default): "
        read value
        value=${value:-$default}
    else
        echo -n "Enter $var_name: "
        read value
    fi
    echo $value
}

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${RED}netlify-cli is not installed. Installing...${NC}"
    npm install -g netlify-cli
fi

# Check if logged in to Netlify
if ! netlify status &> /dev/null; then
    echo -e "${BLUE}Please log in to Netlify${NC}"
    netlify login
fi

# Get site ID or create new site
SITE_ID=$(get_variable "Netlify site ID" "Enter your Netlify site ID (leave blank to create new site)" "")

if [ -z "$SITE_ID" ]; then
    echo -e "${BLUE}Creating new Netlify site...${NC}"
    netlify sites:create
    SITE_ID=$(netlify sites:list --json | jq -r '.[0].id')
fi

# Set up environment variables
echo -e "${BLUE}Setting up environment variables...${NC}"

# Supabase Configuration
SUPABASE_URL=$(get_variable "SUPABASE_URL" "Enter your Supabase project URL")
SUPABASE_ANON_KEY=$(get_variable "SUPABASE_ANON_KEY" "Enter your Supabase anon key")
SUPABASE_SERVICE_KEY=$(get_variable "SUPABASE_SERVICE_KEY" "Enter your Supabase service role key")
netlify env:set SUPABASE_URL "$SUPABASE_URL"
netlify env:set SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY"
netlify env:set SUPABASE_SERVICE_KEY "$SUPABASE_SERVICE_KEY"

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
netlify env:set JWT_SECRET "$JWT_SECRET"

# Admin credentials
ADMIN_EMAIL=$(get_variable "ADMIN_EMAIL" "Enter admin email" "admin@example.com")
ADMIN_PASSWORD=$(get_variable "ADMIN_PASSWORD" "Enter admin password" "admin123")
netlify env:set ADMIN_EMAIL "$ADMIN_EMAIL"
netlify env:set ADMIN_PASSWORD "$ADMIN_PASSWORD"

# Cloudinary
CLOUDINARY_NAME=$(get_variable "CLOUDINARY_CLOUD_NAME" "Enter your Cloudinary cloud name")
CLOUDINARY_KEY=$(get_variable "CLOUDINARY_API_KEY" "Enter your Cloudinary API key")
CLOUDINARY_SECRET=$(get_variable "CLOUDINARY_API_SECRET" "Enter your Cloudinary API secret")
netlify env:set CLOUDINARY_CLOUD_NAME "$CLOUDINARY_NAME"
netlify env:set CLOUDINARY_API_KEY "$CLOUDINARY_KEY"
netlify env:set CLOUDINARY_API_SECRET "$CLOUDINARY_SECRET"

# Create local .env file for development
echo "Creating local .env file..."
cat > .env << EOL
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
JWT_SECRET=${JWT_SECRET}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_SECRET}
EOL

echo -e "${GREEN}Environment setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run setup' to initialize the database"
echo "2. Run 'npm run build' to build the site"
echo "3. Run 'npm run deploy' to deploy to Netlify"
