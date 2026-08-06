FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY client/package.json ./client/

WORKDIR /app/client
RUN npm install

WORKDIR /app
COPY shared/ ./shared/
COPY client/ ./client/

WORKDIR /app/client
RUN npm run build

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/*
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]