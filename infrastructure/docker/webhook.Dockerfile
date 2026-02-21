FROM node:20 AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

WORKDIR /app
COPY . .

# Build backend projects with increased memory
WORKDIR /app/backend
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=true
RUN npm run build webhook

# Production Stage
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./

EXPOSE 3001
EXPOSE 3003

# Default to Webhook
CMD ["node", "dist/webhook-service/main.js"]
