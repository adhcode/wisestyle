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
    # Start the application\n\
    npm run start:prod\n' > start.sh && \
    chmod +x start.sh

# Start the application
CMD ["./start.sh"] 