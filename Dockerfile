# Frontend Dockerfile - Simple version
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use a simple http server
FROM node:18-alpine
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist
WORKDIR /app
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
