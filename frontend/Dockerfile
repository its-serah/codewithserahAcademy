# Multi-stage build: compile Vite app, then serve static files with nginx.
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# VITE_API_URL must be baked in at build time (Vite inlines env vars).
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Railway injects $PORT; substitute into nginx config at runtime.
CMD ["/bin/sh", "-c", "sed -i \"s/listen 8080/listen ${PORT:-8080}/\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
