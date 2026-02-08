# =============================================================================
# Production multi-stage Dockerfile for Kanbox
# Builds frontend with Vite, then serves everything from Express
# =============================================================================

# Stage 1: Install backend production dependencies
FROM node:22-alpine AS backend-deps

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

# Stage 2: Build the React frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci && \
    npm cache clean --force

COPY frontend/ ./

# Override outDir since vite.config.js targets ../backend/public
# which doesn't exist in this build context
RUN npx vite build --outDir dist

# Stage 3: Production image
FROM node:22-alpine AS production

WORKDIR /app

# Copy pre-installed production dependencies
COPY --from=backend-deps /app/node_modules ./node_modules

# Copy backend source and package.json
COPY backend/package*.json ./
COPY backend/src ./src

# Copy built frontend into backend's public directory
# Vite outputs to dist/ (overridden from ../backend/public in build command)
COPY --from=frontend-build /app/frontend/dist ./public

# Create non-root user for security
RUN addgroup -g 1001 -S kanbox && \
    adduser -S kanbox -u 1001 -G kanbox && \
    chown -R kanbox:kanbox /app

USER kanbox

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
