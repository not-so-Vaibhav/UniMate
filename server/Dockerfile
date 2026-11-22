# Production Dockerfile for UniMate Express Core API
FROM node:20-alpine

# Set non-root user for security
WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create uploads directory with appropriate permissions
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/api/v1/health || exit 1

CMD ["node", "src/server.js"]
