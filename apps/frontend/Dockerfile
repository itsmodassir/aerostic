# --------------------
# Builder
# --------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first (better cache)
COPY apps/frontend/package*.json ./apps/frontend/
WORKDIR /app/apps/frontend
RUN npm ci

# Copy rest of the code
WORKDIR /app
COPY . .

WORKDIR /app/apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --------------------
# Runner
# --------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone output
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000

WORKDIR /app/apps/frontend

CMD ["node", "server.js"]
