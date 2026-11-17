FROM node:22-bookworm-slim AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
COPY shared /app/shared
RUN npm run typecheck && npm run build

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/*
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/app.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
