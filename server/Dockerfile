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

# Create start script with health check
RUN printf '#!/bin/sh\n\
    # Create .env file with environment variables\n\
    cat > .env << EOL\n\
    DATABASE_URL="${DATABASE_URL}"\n\
    REDIS_URL="${REDIS_URL}"\n\
    JWT_SECRET="${JWT_SECRET}"\n\
    PORT="${PORT:-3001}"\n\
    NODE_ENV="${NODE_ENV:-production}"\n\
    EOL\n\
    \n\
    # Print environment variables\n\
    echo "Content of .env file:"\n\
    cat .env\n\
    \n\
    # Start the application with a timeout\n\
    timeout 30s npm run start:prod || {\n\
    echo "Application failed to start within 30 seconds"\n\
    exit 1\n\
    }\n' > start.sh && \
    chmod +x start.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["./start.sh"] 