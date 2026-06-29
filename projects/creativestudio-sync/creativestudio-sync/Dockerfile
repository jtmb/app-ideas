# Multi-stage Dockerfile for Creative Studio Sync
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies only (no devDependencies)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Run build scripts if any
RUN npm run build 2>/dev/null || true

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD node -e "require("http").get("http://localhost:3000/health", (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/index.js"]