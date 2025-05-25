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

# Start the application with environment variables
CMD DATABASE_URL=${DATABASE_URL} \
    REDIS_URL=${REDIS_URL} \
    JWT_SECRET=${JWT_SECRET} \
    PORT=${PORT:-3001} \
    NODE_ENV=${NODE_ENV:-production} \
    npm run start:prod 