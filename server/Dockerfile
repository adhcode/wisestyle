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

# Create startup script
RUN echo '#!/bin/sh\n\
    echo "Environment variables:"\n\
    echo "DATABASE_URL=$DATABASE_URL"\n\
    echo "REDIS_URL=$REDIS_URL"\n\
    echo "JWT_SECRET=$JWT_SECRET"\n\
    echo "PORT=$PORT"\n\
    echo "NODE_ENV=$NODE_ENV"\n\
    \n\
    exec npm run start:prod' > /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

# Start the application
CMD ["/usr/src/app/start.sh"] 