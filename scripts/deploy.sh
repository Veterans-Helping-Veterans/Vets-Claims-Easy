#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting deployment process...${NC}"

# Check if all required tools are installed
check_requirements() {
    echo -e "\n${BLUE}Checking requirements...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed. Please install npm first.${NC}"
        exit 1
    }
    
    # Check netlify-cli
    if ! command -v netlify &> /dev/null; then
        echo -e "${BLUE}Installing netlify-cli...${NC}"
        npm install -g netlify-cli
    fi
    
    echo -e "${GREEN}✓ All requirements satisfied${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "\n${BLUE}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Setup environment
setup_environment() {
    echo -e "\n${BLUE}Setting up environment...${NC}"
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo -e "${BLUE}Running environment setup...${NC}"
        ./scripts/setup-env.sh
    else
        echo -e "${GREEN}✓ Environment already configured${NC}"
    fi
}

# Initialize database
init_database() {
    echo -e "\n${BLUE}Initializing database...${NC}"
    npm run setup
    echo -e "${GREEN}✓ Database initialized${NC}"
}

# Build the project
build_project() {
    echo -e "\n${BLUE}Building project...${NC}"
    npm run build
    echo -e "${GREEN}✓ Build complete${NC}"
}

# Deploy to Netlify
deploy_to_netlify() {
    echo -e "\n${BLUE}Deploying to Netlify...${NC}"
    npm run deploy
    echo -e "${GREEN}✓ Deployment complete${NC}"
}

# Main deployment process
main() {
    check_requirements
    install_dependencies
    setup_environment
    init_database
    build_project
    deploy_to_netlify
    
    echo -e "\n${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${BLUE}Your site should now be live on Netlify.${NC}"
    netlify open:site
}

# Run the deployment
main
