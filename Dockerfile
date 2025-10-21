# Используем официальный Node.js образ для сборки приложения
FROM node:22.18-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/sakai-ng/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
