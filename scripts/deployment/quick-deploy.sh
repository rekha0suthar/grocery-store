#!/bin/bash

# Quick Deployment Script
# One-click deployment for common scenarios

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[QUICK DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Quick Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  staging          Deploy to staging environment"
    echo "  production       Deploy to production environment"
    echo "  backend-staging  Deploy only backend to staging"
    echo "  frontend-staging Deploy only frontend to staging"
    echo "  backend-prod     Deploy only backend to production"
    echo "  frontend-prod    Deploy only frontend to production"
    echo "  emergency        Emergency deployment (skip tests)"
    echo "  rollback         Rollback to previous version"
    echo ""
    echo "Examples:"
    echo "  $0 staging                    # Quick deploy to staging"
    echo "  $0 production                 # Quick deploy to production"
    echo "  $0 backend-staging            # Deploy only backend to staging"
    echo "  $0 emergency                  # Emergency deployment"
}

# Check if command is provided
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

COMMAND="$1"

case "$COMMAND" in
    "staging")
        print_status "Quick deploying to staging..."
        ./scripts/deployment/deploy.sh -e staging
        ;;
    "production")
        print_status "Quick deploying to production..."
        ./scripts/deployment/deploy.sh -e production
        ;;
    "backend-staging")
        print_status "Quick deploying backend to staging..."
        ./scripts/deployment/deploy.sh -e staging -b
        ;;
    "frontend-staging")
        print_status "Quick deploying frontend to staging..."
        ./scripts/deployment/deploy.sh -e staging -f
        ;;
    "backend-prod")
        print_status "Quick deploying backend to production..."
        ./scripts/deployment/deploy.sh -e production -b
        ;;
    "frontend-prod")
        print_status "Quick deploying frontend to production..."
        ./scripts/deployment/deploy.sh -e production -f
        ;;
    "emergency")
        print_status "Emergency deployment (skipping tests)..."
        ./scripts/deployment/deploy.sh -e production -s
        ;;
    "rollback")
        print_status "Rolling back to previous version..."
        # Add rollback logic here
        echo "Rollback functionality to be implemented"
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac

print_success "Quick deployment completed!"
