########## 1️⃣  Build stage ####################################################
FROM node:18-alpine AS builder
WORKDIR /app

# Install full deps (includes dev) -------------------------------------------
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps

# Generate Prisma client & build NestJS --------------------------------------
RUN npx prisma generate
COPY . .
RUN npm run build

# Remove dev-only deps so next stage copies a lean node_modules --------------
RUN npm prune --omit=dev


########## 2️⃣  Runtime stage ##################################################
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy production node_modules, dist, prisma, and start script ---------------
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Use a non-root user for security (optional) --------------------------------
USER node

# Expose port Railway (and dev) expect ---------------------------------------
EXPOSE 3001

# Launch ---------------------------------------------------------------------
CMD ["./start.sh"] 