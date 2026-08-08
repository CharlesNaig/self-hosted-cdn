FROM node:20-alpine AS client-build

WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY private-admin-gateway/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=client-build /build/client/dist /usr/share/nginx/html
