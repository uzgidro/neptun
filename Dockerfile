# Stage 1: Build the Angular application
FROM node:22.18-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx and config injection
FROM nginx:alpine

# Install yq for YAML to JSON conversion
RUN apk add --no-cache yq

RUN rm -rf /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/sakai-ng/browser /usr/share/nginx/html

# Copy config injection script
COPY inject-config.sh /usr/local/bin/inject-config.sh
RUN chmod +x /usr/local/bin/inject-config.sh

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
