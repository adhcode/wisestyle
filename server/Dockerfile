# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps

# Copy app source
COPY . .

# Clean dist directory and generate Prisma client
RUN rm -rf dist && npx prisma generate

# Build application with verbose output
RUN npm run build --verbose

# List contents of the directory to debug
RUN ls -la && \
    echo "Contents of current directory:" && \
    ls -la && \
    echo "Contents of dist directory (if it exists):" && \
    ls -la dist || echo "dist directory not found"

# Expose port
EXPOSE 3001

# Start the server
CMD [ "npm", "run", "start:prod" ] 