# =============================================================================
# StudySync AI - Multi-stage Dockerfile
# =============================================================================
# Stage 1: Build stage - Install dependencies and build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript)
RUN npm ci

# Copy source code
COPY . .

# Install production dependencies only and run build
RUN npm ci --omit=dev && \
    npm run build

# =============================================================================
# Stage 2: Production stage - Minimal runtime image
# =============================================================================
FROM node:20-alpine AS production

# Create non-root user for security (follows containers.instructions.md)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary config files (excluding secrets)
COPY .env.example .env.production

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check for containers.instructions.md compliance
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/index.js"]