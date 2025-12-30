# Stage 1: Builder - збірка frontend з Vite
FROM node:18-alpine AS builder

WORKDIR /app

# Копіювати package files
COPY package*.json ./

# Встановити всі dependencies (включно з dev для vite build)
RUN npm ci

# Копіювати вихідний код
COPY . .

# Зібрати frontend (vite build → dist/)
RUN npm run build

# Stage 2: Production - мінімальний runtime контейнер
FROM node:18-alpine

WORKDIR /app

# Встановити тільки production dependencies
RUN npm install express@4.18.2 postgres@3.4.3 cors@2.8.5

# Копіювати зібраний frontend зі stage 1
COPY --from=builder /app/dist ./dist

# Копіювати API функції (Vercel Functions)
COPY api ./api

# Копіювати Express server adapter
COPY server.js ./server.js

# Expose порт
EXPOSE 3000

# Environment variables (можуть бути перевизначені в docker-compose.yml)
ENV NODE_ENV=production
ENV PORT=3000

# Запуск Express сервера
CMD ["node", "server.js"]
