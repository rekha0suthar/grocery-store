#!/bin/bash

# Universal Deployment Script
# Supports multiple deployment targets and environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true
SKIP_TESTS=false
VERBOSE=false
DRY_RUN=false

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Deployment environment (staging|production) [default: staging]"
    echo "  -b, --backend            Deploy backend only"
    echo "  -f, --frontend           Deploy frontend only"
    echo "  -s, --skip-tests         Skip tests (emergency deployment)"
    echo "  -v, --verbose            Verbose output"
    echo "  -d, --dry-run            Show what would be deployed without actually deploying"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e production                    # Deploy both to production"
    echo "  $0 -e staging -b                    # Deploy only backend to staging"
    echo "  $0 -e production -s                 # Emergency deployment to production"
    echo "  $0 -d                               # Dry run to see what would be deployed"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--backend)
            DEPLOY_BACKEND=true
            DEPLOY_FRONTEND=false
            shift
            ;;
        -f|--frontend)
            DEPLOY_FRONTEND=true
            DEPLOY_BACKEND=false
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
    exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if required tools are installed
    local required_tools=("docker" "kubectl" "helm")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            print_warning "$tool is not installed. Some deployment features may not work."
        fi
    done
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" && ! -d "backend" && ! -d "frontend" ]]; then
        print_error "This doesn't appear to be a valid project directory"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Function to load environment configuration
load_environment_config() {
    print_status "Loading environment configuration for $ENVIRONMENT..."
    
    local env_file=".env.$ENVIRONMENT"
    if [[ -f "$env_file" ]]; then
        source "$env_file"
        print_success "Loaded configuration from $env_file"
    else
        print_warning "No environment file found: $env_file"
    fi
}

# Function to deploy backend
deploy_backend() {
    if [[ "$DEPLOY_BACKEND" != "true" ]]; then
        return 0
    fi
    
    print_status "Deploying backend to $ENVIRONMENT..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "DRY RUN: Would deploy backend to $ENVIRONMENT"
        return 0
    fi
    
    # Build backend Docker image
    print_status "Building backend Docker image..."
    docker build -f backend/Dockerfile -t "backend:$ENVIRONMENT" ./backend
    
    # Deploy using Kubernetes
    if command -v kubectl &> /dev/null; then
        print_status "Deploying to Kubernetes..."
        kubectl set image deployment/backend backend="backend:$ENVIRONMENT" -n "$ENVIRONMENT"
        kubectl rollout status deployment/backend -n "$ENVIRONMENT"
    else
        print_warning "kubectl not found. Skipping Kubernetes deployment."
    fi
    
    # Deploy using Docker Compose
    if [[ -f "docker-compose.$ENVIRONMENT.yml" ]]; then
        print_status "Deploying with Docker Compose..."
        docker-compose -f "docker-compose.$ENVIRONMENT.yml" up -d backend
    fi
    
    print_success "Backend deployment completed"
}

# Function to deploy frontend
deploy_frontend() {
    if [[ "$DEPLOY_FRONTEND" != "true" ]]; then
        return 0
    fi
    
    print_status "Deploying frontend to $ENVIRONMENT..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "DRY RUN: Would deploy frontend to $ENVIRONMENT"
        return 0
    fi
    
    # Build frontend
    print_status "Building frontend..."
    # cd frontend
    # npm ci
    ../frontend-build.sh
    
    # Build frontend Docker image
    print_status "Building frontend Docker image..."
    docker build -f frontend/Dockerfile -t "frontend:$ENVIRONMENT" frontend/
    
    # Deploy using Kubernetes
    if command -v kubectl &> /dev/null; then
        print_status "Deploying to Kubernetes..."
        kubectl set image deployment/frontend frontend="frontend:$ENVIRONMENT" -n "$ENVIRONMENT"
        kubectl rollout status deployment/frontend -n "$ENVIRONMENT"
    else
        print_warning "kubectl not found. Skipping Kubernetes deployment."
    fi
    
    # Deploy using Docker Compose
    if [[ -f "../docker-compose.$ENVIRONMENT.yml" ]]; then
        print_status "Deploying with Docker Compose..."
        docker-compose -f "../docker-compose.$ENVIRONMENT.yml" up -d frontend
    fi
    
    cd ..
    print_success "Frontend deployment completed"
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    local backend_url=""
    local frontend_url=""
    
    # Set URLs based on environment
    if [[ "$ENVIRONMENT" == "production" ]]; then
        backend_url="https://api.yourapp.com"
        frontend_url="https://yourapp.com"
    else
        backend_url="https://staging-api.yourapp.com"
        frontend_url="https://staging.yourapp.com"
    fi
    
    # Check backend health
    if [[ "$DEPLOY_BACKEND" == "true" ]]; then
        print_status "Checking backend health..."
        if curl -f "$backend_url/health" > /dev/null 2>&1; then
            print_success "Backend is healthy"
        else
            print_error "Backend health check failed"
            return 1
        fi
    fi
    
    # Check frontend health
    if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
        print_status "Checking frontend health..."
        if curl -f "$frontend_url" > /dev/null 2>&1; then
            print_success "Frontend is healthy"
        else
            print_error "Frontend health check failed"
            return 1
        fi
    fi
    
    print_success "All health checks passed"
}

# Function to send notifications
send_notifications() {
    local status="$1"
    local message="$2"
    
    print_status "Sending notifications..."
    
    # Send Slack notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Send email notification
    if [[ -n "$EMAIL_RECIPIENTS" ]]; then
        echo "$message" | mail -s "Deployment $status" "$EMAIL_RECIPIENTS"
    fi
    
    print_success "Notifications sent"
}

# Main deployment function
main() {
    print_status "Starting deployment to $ENVIRONMENT..."
    print_status "Backend: $DEPLOY_BACKEND, Frontend: $DEPLOY_FRONTEND"
    print_status "Skip tests: $SKIP_TESTS, Dry run: $DRY_RUN"
    
    # Check prerequisites
    check_prerequisites
    
    # Load environment configuration
    load_environment_config
    
    # Deploy components
    if [[ "$DEPLOY_BACKEND" == "true" ]]; then
        deploy_backend
    fi
    
    if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
        deploy_frontend
    fi
    
    # Run health checks
    if [[ "$DRY_RUN" != "true" ]]; then
        if run_health_checks; then
            print_success "Deployment to $ENVIRONMENT completed successfully!"
            send_notifications "SUCCESS" "✅ Deployment to $ENVIRONMENT completed successfully!"
        else
            print_error "Deployment to $ENVIRONMENT failed health checks!"
            send_notifications "FAILURE" "❌ Deployment to $ENVIRONMENT failed health checks!"
            exit 1
        fi
    else
        print_success "Dry run completed successfully!"
    fi
}

# Run main function
main "$@"
