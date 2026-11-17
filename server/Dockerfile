FROM node:22-bookworm-slim AS builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
COPY shared /app/shared
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /app/server/package*.json ./server/
COPY --from=builder --chown=node:node /app/server/node_modules ./server/node_modules
COPY --from=builder --chown=node:node /app/server/dist ./server/dist
USER node
EXPOSE 5000
CMD ["sh", "-c", "node server/dist/server/src/migrate.js && exec node server/dist/server/src/server.js"]
