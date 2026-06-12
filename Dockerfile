# ── Stage 1: Build React (Vite) ─────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files trước để tận dụng Docker layer cache
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source và build
COPY . .
RUN npm run build

# ── Stage 2: Serve static bằng Nginx ────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Copy file build từ stage 1 vào nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Config nginx cho React SPA (handle client-side routing)
COPY nginx-fe.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
