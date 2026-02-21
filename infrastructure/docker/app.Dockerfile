# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/app-dashboard/package*.json ./frontend/app-dashboard/
WORKDIR /app/frontend/app-dashboard
RUN npm install --legacy-peer-deps
WORKDIR /app
COPY . .
WORKDIR /app/frontend/app-dashboard
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_META_APP_ID
ARG NEXT_PUBLIC_BASE_DOMAIN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_META_APP_ID=$NEXT_PUBLIC_META_APP_ID
ENV NEXT_PUBLIC_BASE_DOMAIN=$NEXT_PUBLIC_BASE_DOMAIN
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
COPY --from=builder /app/frontend/app-dashboard/.next/standalone ./
COPY --from=builder /app/frontend/app-dashboard/.next/static ./.next/static
COPY --from=builder /app/frontend/app-dashboard/public ./public
EXPOSE 3000
WORKDIR /app
CMD ["node", "server.js"]
