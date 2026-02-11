# Stage 1: Build
FROM node:22.13.1-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx-unprivileged (runs as non-root)
FROM nginxinc/nginx-unprivileged:alpine

# Fix vulnerabilities
USER root
RUN apk upgrade --no-cache libcrypto3 libssl3 libexpat
USER nginx


COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/sakai-ng/browser /usr/share/nginx/html

EXPOSE 8080
