# Build stage for frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Build stage for backend
FROM node:22-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client and build backend
RUN npx prisma generate
RUN npm run build:backend

# Production stage
FROM node:22-alpine AS production

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built backend from builder stage
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built frontend from frontend builder stage
COPY --from=frontend-builder /app/frontend/dist ./public

# Copy Prisma files for runtime
COPY prisma/ ./prisma/

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Generate Prisma client for production
RUN npx prisma generate

# Create necessary directories
RUN mkdir -p /data

# Set default environment variable for database location
ENV DATABASE_URL=file:/data/database.db

# Expose port
EXPOSE 3000

# Health check (try HTTPS first, fallback to HTTP)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD (node -e "process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'; require('https').get('https://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" 2>/dev/null) || \
      (node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1)

# Start the application
CMD ["./docker-entrypoint.sh"]
