# Frontend Dockerfile - Fixed Version
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Production stage with proper nginx config
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx log directory and set permissions
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
