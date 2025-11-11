#!/bin/bash

# Kuyash Farm Management System - Render Deployment Script
# This script automates the deployment process to Render

set -e  # Exit on any error

echo "🚀 Starting Kuyash Farm Management System deployment to Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn is not installed"
        exit 1
    fi
    
    if ! command -v render &> /dev/null; then
        print_warning "Render CLI is not installed. Install it with:"
        print_warning "curl https://render.com/install.sh | sh"
    fi
    
    print_success "Requirements check passed"
}

# Validate project structure
validate_project() {
    print_status "Validating project structure..."
    
    if [ ! -f "package.json" ]; then
        print_error "Root package.json not found"
        exit 1
    fi
    
    if [ ! -d "client" ]; then
        print_error "Client directory not found"
        exit 1
    fi
    
    if [ ! -d "server" ]; then
        print_error "Server directory not found"
        exit 1
    fi
    
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found"
        exit 1
    fi
    
    print_success "Project structure validated"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    yarn install
    
    # Client dependencies
    cd client && yarn install && cd ..
    
    # Server dependencies
    cd server && yarn install && cd ..
    
    # Shared dependencies
    cd shared && yarn install && cd ..
    
    print_success "Dependencies installed"
}

# Build the project
build_project() {
    print_status "Building project..."
    
    # Build all packages
    yarn build:all
    
    print_success "Project built successfully"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run server tests
    cd server && yarn test && cd ..
    
    # Run client tests (if available)
    if [ -d "client/src/tests" ]; then
        cd client && yarn test && cd ..
    fi
    
    print_success "Tests completed"
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f ".env.render" ]; then
        cp .env.render.example .env.render
        print_warning "Created .env.render from template. Please update it with your actual values."
        print_warning "Required variables: JWT_SECRET, CORS_ORIGIN"
    else
        print_warning ".env.render already exists"
    fi
}

# Deploy to Render
deploy_to_render() {
    print_status "Deploying to Render..."
    
    if command -v render &> /dev/null; then
        # Deploy using Render CLI
        render deploy --yaml render.yaml
    else
        print_warning "Render CLI not found. Please deploy manually via:"
        print_warning "1. Visit https://render.com"
        print_warning "2. Connect your GitHub repository"
        print_warning "3. Use the render.yaml blueprint"
    fi
    
    print_success "Deployment initiated"
}

# Post-deployment verification
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait for deployment to complete
    print_status "Waiting for deployment to complete (this may take a few minutes)..."
    sleep 30
    
    # Test health endpoints (if URLs are available)
    if [ -n "$FRONTEND_URL" ]; then
        print_status "Testing frontend..."
        curl -f "$FRONTEND_URL" || print_warning "Frontend test failed"
    fi
    
    if [ -n "$BACKEND_URL" ]; then
        print_status "Testing backend..."
        curl -f "$BACKEND_URL/api/health" || print_warning "Backend test failed"
    fi
    
    print_success "Deployment verification completed"
}

# Main deployment function
main() {
    echo "🌾 Kuyash Farm Management System - Render Deployment"
    echo "======================================================"
    
    # Run deployment steps
    check_requirements
    validate_project
    create_env_file
    install_dependencies
    build_project
    run_tests
    deploy_to_render
    verify_deployment
    
    echo ""
    echo "🎉 Deployment process completed!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.render with your actual values"
    echo "2. Monitor deployment progress on Render dashboard"
    echo "3. Test the application once deployment is complete"
    echo "4. Set up custom domains if needed"
    echo ""
    echo "For support, check the deployment plan at: tasks/render-deployment-plan.md"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"