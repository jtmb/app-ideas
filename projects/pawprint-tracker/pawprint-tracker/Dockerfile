# =============================================================================
# Multi-stage Dockerfile for PawPrint Tracker
# =============================================================================
# Stage 1: Build stage - Install dependencies and build application
# Stage 2: Production stage - Minimal runtime with only production dependencies
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application (if needed - e.g., TypeScript compilation)
# For Express apps, this may be a no-op if using runtime TypeScript support
RUN npm run build 2>/dev/null || true

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install tini for proper signal handling (PID 1)
RUN apk add --no-cache tini && \
    apk add --no-cache ca-certificates

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# Copy production dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodejs:nodejs . .

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["npm", "start"]