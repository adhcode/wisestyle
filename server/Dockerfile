########## 1️⃣  Build stage ####################################################
FROM node:18-alpine AS builder
WORKDIR /app

# Install full deps (includes dev) -------------------------------------------
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --legacy-peer-deps

# Generate Prisma client & build NestJS --------------------------------------
RUN npx prisma generate
COPY . .
RUN npm run build


########## 2️⃣  Runtime stage ##################################################
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy production node_modules, dist, prisma, and start script ---------------
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY start.sh ./start.sh
RUN chmod 755 ./start.sh

# Expose port Railway (and dev) expect ---------------------------------------
EXPOSE 3001

# Launch ---------------------------------------------------------------------
CMD ["./start.sh"]