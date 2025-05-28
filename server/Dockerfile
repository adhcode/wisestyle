# Use Node.js 18 Alpine as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code and start script
COPY . .
COPY start.sh /usr/src/app/start.sh

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Make start script executable
RUN chmod +x /usr/src/app/start.sh

# Expose the port
EXPOSE 3001

# Start the application
CMD ["/usr/src/app/start.sh"] 