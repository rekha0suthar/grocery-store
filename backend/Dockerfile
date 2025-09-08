# Multi-stage build for backend with core package
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files for core package
COPY packages/core/package*.json ./packages/core/

# Install core package dependencies
WORKDIR /app/packages/core
RUN npm install --omit=dev

# Copy core package source
COPY packages/core/ .

# Back to main app
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --omit=dev

# Copy backend source
COPY backend/ .

# Create symlink to core package
RUN ln -sf ../../packages/core node_modules/@grocery-store/core

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
