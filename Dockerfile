# Frontend Dockerfile
# Multi-stage build for React + Vite application

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use legacy-peer-deps for React 19 compatibility)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_BACKEND_URL
ARG VITE_FRONTEND_URL

# Set environment variables for build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
