#!/bin/bash

# Setup script for monorepo CI/CD pipeline
# This script ensures proper linking of local packages

set -e

echo "🔧 Setting up monorepo for CI/CD..."

# Create symlinks for local packages
echo "📦 Creating symlinks for local packages..."

# Backend -> Core package
if [ -d "backend" ] && [ -d "packages/core" ]; then
    echo "  - Linking @grocery-store/core to backend..."
    mkdir -p backend/node_modules/@grocery-store
    ln -sf ../../../packages/core backend/node_modules/@grocery-store/core
    echo "  ✅ Backend core package linked"
fi

# Frontend -> Core package (if frontend exists)
if [ -d "frontend" ] && [ -d "packages/core" ]; then
    echo "  - Linking @grocery-store/core to frontend..."
    mkdir -p frontend/node_modules/@grocery-store
    ln -sf ../../../packages/core frontend/node_modules/@grocery-store/core
    echo "  ✅ Frontend core package linked"
fi

echo "🎉 Monorepo setup complete!"
