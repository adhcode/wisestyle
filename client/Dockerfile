FROM node:18.18-alpine3.18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --no-audit --no-fund --loglevel error && \
    npm install sonner --no-audit --no-fund --loglevel error

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 