FROM node:20-alpine AS client-build

WORKDIR /build/client
ARG VITE_PUBLIC_CDN_BASE_URL=""
ENV VITE_PUBLIC_CDN_BASE_URL=$VITE_PUBLIC_CDN_BASE_URL
COPY client/package*.json ./
# Vite is a build-time devDependency.  Explicitly include dev dependencies so
# a production-oriented npm configuration cannot omit the compiler.
RUN npm ci --include=dev
COPY client/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY private-admin-gateway/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=client-build /build/client/dist /usr/share/nginx/html
