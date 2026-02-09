# Production multi-stage Dockerfile for Kanbox
# Builds frontend with Vite, then serves everything from Express

FROM node:22-alpine AS backend-deps

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

COPY frontend/ ./

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=backend-deps /app/node_modules ./node_modules

COPY backend/package*.json ./
COPY backend/src ./src

COPY --from=frontend-build /app/frontend/dist ./public

RUN addgroup -g 1001 -S kanbox && \
    adduser -S kanbox -u 1001 -G kanbox && \
    chown -R kanbox:kanbox /app

USER kanbox

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
