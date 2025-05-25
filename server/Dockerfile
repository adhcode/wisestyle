# Use Node.js 18 Alpine as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Clean npm cache and install dependencies with legacy peer deps
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3001

# Create start script
RUN printf '#!/bin/sh\necho "Environment variables:"\necho "DATABASE_URL=${DATABASE_URL}"\necho "REDIS_URL=${REDIS_URL}"\necho "JWT_SECRET=${JWT_SECRET}"\necho "PORT=${PORT}"\necho "NODE_ENV=${NODE_ENV}"\n\nnpm run start:prod\n' > start.sh && \
    chmod +x start.sh

# Start the application
CMD ["./start.sh"] 