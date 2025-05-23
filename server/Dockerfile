# Build stage
FROM node:18.18-alpine3.18 AS builder

WORKDIR /app

# Add necessary packages for Prisma
RUN apk add --no-cache openssl yarn

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn config set network-timeout 300000 && \
    yarn install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application (excluding node_modules)
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:18.18-alpine3.18

WORKDIR /app

# Add necessary packages for Prisma
RUN apk add --no-cache openssl yarn

# Copy package files and install production dependencies
COPY package*.json ./
RUN yarn config set network-timeout 300000 && \
    yarn install --production

# Copy Prisma schema and generate client
COPY --from=builder /app/prisma ./prisma/
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create startup script
RUN printf '#!/bin/sh\n\
    echo "Waiting for database to be ready..."\n\
    until npx prisma db push; do\n\
    echo "Database is unavailable - sleeping"\n\
    sleep 1\n\
    done\n\
    echo "Database is ready - starting the application"\n\
    yarn start:prod\n' > /app/start.sh && \
    chmod +x /app/start.sh

# Expose the port
EXPOSE 3001

# Start the application using the startup script
CMD ["/app/start.sh"] 