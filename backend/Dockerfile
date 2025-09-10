# ---- Stage 1: build & pack core ----
FROM node:18-alpine AS core-builder
WORKDIR /app
# copy only core first for better caching
COPY packages/core/package*.json packages/core/
RUN --mount=type=cache,target=/root/.npm cd packages/core && npm ci || npm i
COPY packages/core/ packages/core/
RUN cd packages/core && npm run build && npm pack
# -> /app/packages/core/@grocery-store-core-*.tgz

# ---- Stage 2: build backend & install core tar ----
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json backend/
COPY --from=core-builder /app/packages/core/*.tgz /tmp/core.tgz

# Create a new package.json with the core tarball dependency
RUN cd backend && \
    node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); \
             pkg.dependencies['@grocery-store/core'] = 'file:/tmp/core.tgz'; \
             require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

RUN --mount=type=cache,target=/root/.npm cd backend \
  && npm ci || npm i

# Copy backend source (but not package.json since we already modified it)
COPY backend/src backend/src
COPY backend/scripts backend/scripts
RUN cd backend && npm run build

# ---- Stage 3: runtime ----
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-builder /app/backend/node_modules backend/node_modules
COPY --from=backend-builder /app/backend/src backend/src
COPY --from=backend-builder /app/backend/package.json backend/package.json
EXPOSE 3000
CMD ["node", "backend/src/server.js"]
