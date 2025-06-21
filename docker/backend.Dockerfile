# Multi-stage Dockerfile for NestJS Backend
FROM node:24-alpine3.22 AS base

# Install security updates and pnpm
RUN apk update && apk upgrade && \
    npm install -g pnpm

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development

# Copy package files first for better caching
COPY src/backend/package*.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY src/backend/ .

# Expose port
EXPOSE 3001

# Development command with clean build
CMD ["sh", "-c", "rm -rf dist && pnpm install && pnpm run start:dev"]

# Production build stage
FROM base AS build

# Copy package files
COPY src/backend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install

# Copy source code
COPY src/backend/ .

# Build the application
RUN pnpm run build

# Production stage
FROM base AS production

# Copy package files
COPY src/backend/package*.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy built application
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Production command
CMD ["node", "dist/main.js"] 