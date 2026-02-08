# =============================================================================
# Production multi-stage Dockerfile for Kanbox
# Builds frontend with Vite, then serves everything from Express
# =============================================================================

# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# Build outputs to ../backend/public (relative to frontend dir)
# We override outDir here so it writes to a clean location we control
RUN npx vite build --outDir /app/frontend-dist

# Stage 2: Production backend
FROM node:22-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/src ./src

# Copy built frontend into backend's public directory
COPY --from=frontend-build /app/frontend-dist ./public

# Create non-root user for security
RUN addgroup -g 1001 -S kanbox && \
    adduser -S kanbox -u 1001 -G kanbox

USER kanbox

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
