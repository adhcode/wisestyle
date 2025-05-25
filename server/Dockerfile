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

# Create a .env file with default values (these will be overridden by Render's environment variables)
RUN echo "JWT_SECRET=${JWT_SECRET:-default_jwt_secret}" > .env && \
    echo "REDIS_URL=${REDIS_URL:-redis://localhost:6379}" >> .env && \
    echo "DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/wisestyle?schema=public}" >> .env

# Clean dist directory and generate Prisma client
RUN rm -rf dist && npx prisma generate

# Build the application
RUN npm run build

# List contents of the directory to debug
RUN ls -la && \
    echo "Contents of current directory:" && \
    ls -la && \
    echo "Contents of dist directory (if it exists):" && \
    ls -la dist || echo "dist directory not found"

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"] 