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

# Build application
RUN npm run build

# Verify dist directory exists and contains main.js
RUN ls -la dist && test -f dist/main.js

# Expose port
EXPOSE 3001

# Start the server
CMD [ "npm", "run", "start:prod" ] 