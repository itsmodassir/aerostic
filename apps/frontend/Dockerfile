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

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app/apps/frontend

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built files and dependencies
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/package*.json ./
COPY --from=builder /app/apps/frontend/node_modules ./node_modules

EXPOSE 3000

ENV PORT 3000
CMD ["npm", "start"]
