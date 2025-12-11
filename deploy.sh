#!/bin/bash

# Deploy Script for Predictive Maintenance Collector
# This script automates the deployment process on a VPS

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/predictive-maintenance"
BACKUP_DIR="/var/backups/predictive-maintenance"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Backup current deployment
if [ -d "$APP_DIR" ]; then
    print_warning "Creating backup of current deployment..."
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" . 2>/dev/null || true
    print_success "Backup created: backup_$TIMESTAMP.tar.gz"
fi

# Navigate to app directory
cd $APP_DIR || exit 1

# Pull latest code (if using Git)
if [ -d ".git" ]; then
    print_warning "Pulling latest code from repository..."
    git pull origin main
    print_success "Code updated"
fi

# Install dependencies
print_warning "Installing production dependencies..."
npm ci --only=production
print_success "Dependencies installed"

# Build the application
print_warning "Building the application..."
npm run build
print_success "Build completed"

# Restart the application using PM2
print_warning "Restarting application..."
pm2 restart ecosystem.config.js
print_success "Application restarted"

# Check application status
sleep 3
if pm2 list | grep -q "online"; then
    print_success "Application is running successfully!"
else
    print_error "Application failed to start. Check logs with: pm2 logs"
    exit 1
fi

# Clean old backups (keep last 5)
print_warning "Cleaning old backups..."
cd $BACKUP_DIR
ls -t backup_*.tar.gz | tail -n +6 | xargs rm -f 2>/dev/null || true
print_success "Old backups cleaned"

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs predictive-maintenance"
echo "  - Monitor app: pm2 monit"
echo "  - Restart app: pm2 restart predictive-maintenance"
