# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/landing/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/landing/ .
RUN npm run build

# Production stage
FROM nginx:1.25-alpine
COPY infrastructure/nginx/marketing.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
