# Use Node.js 18 Alpine as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3001

# Create start script
RUN echo '#!/bin/sh\n\
    echo "Starting application..."\n\
    exec npm run start:prod\n' > /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

# Start the application
CMD ["/usr/src/app/start.sh"] 