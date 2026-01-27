FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/frontend/package*.json ./apps/frontend/
WORKDIR /app/apps/frontend
RUN npm ci
WORKDIR /app

COPY . .

# Build frontend
WORKDIR /app/apps/frontend
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy only necessary files
COPY --from=builder /app/apps/frontend/package.json .
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/apps/frontend/public ./public

EXPOSE 3000

ENV PORT 3000
CMD ["node", "server.js"]
