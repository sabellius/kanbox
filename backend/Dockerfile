# =============================================================================
# Development-only Dockerfile for the backend
# Used when running the backend inside Docker during development.
# For production, use the root Dockerfile instead.
# =============================================================================

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
