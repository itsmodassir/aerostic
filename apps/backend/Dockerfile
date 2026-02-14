FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/backend/package*.json ./apps/backend/
WORKDIR /app/apps/backend
RUN npm install --legacy-peer-deps
WORKDIR /app

COPY . .

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./

EXPOSE 3001

CMD ["node", "dist/main"]
