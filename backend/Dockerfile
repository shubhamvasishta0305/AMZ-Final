# Backend Dockerfile - Simple working version
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create a simple startup script
RUN echo 'console.log("Starting backend server on port:", process.env.PORT || 5000);' > startup.js

EXPOSE 5000

# Use the PORT environment variable provided by Cloud Run
CMD ["node", "server.js"]
