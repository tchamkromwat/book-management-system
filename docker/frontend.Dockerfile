# Multi-stage Dockerfile for Nuxt.js Frontend
FROM node:24-alpine3.22 AS base

# Install security updates and pnpm
RUN apk update && apk upgrade && \
    npm install -g pnpm

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development

# Copy package files first for better caching
COPY src/frontend/package*.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY src/frontend/ .

# Expose port
EXPOSE 3000

# Development command with clean build
CMD ["sh", "-c", "rm -rf .nuxt .output && pnpm install && pnpm run dev --host 0.0.0.0"]

# Production build stage
FROM base AS build

# Copy package files
COPY src/frontend/package*.json ./

# Install all dependencies
RUN pnpm install

# Copy source code
COPY src/frontend/ .

# Build the application
RUN pnpm run build

# Production stage
FROM base AS production

# Copy package files
COPY src/frontend/package*.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy built application
COPY --from=build /app/.output ./.output

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxtjs -u 1001

# Change ownership of the app directory
RUN chown -R nuxtjs:nodejs /app

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Production command
CMD ["node", ".output/server/index.mjs"] 