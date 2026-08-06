FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/

WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY shared/ ./shared/
COPY server/ ./server/

WORKDIR /app/server
RUN npm run build

FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/

WORKDIR /app/server
RUN npm install --only=production

WORKDIR /app
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared ./shared

EXPOSE 5000

CMD ["node", "server/dist/server/src/server.js"]