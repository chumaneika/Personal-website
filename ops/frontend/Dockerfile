# syntax=docker/dockerfile:1

FROM node:22.17.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend-public/package.json frontend-public/package.json
COPY frontend-admin/package.json frontend-admin/package.json
COPY ops/frontend/verify-build.mjs ops/frontend/verify-build.mjs

RUN npm ci

COPY frontend-public frontend-public
COPY frontend-admin frontend-admin

ARG FRONTEND_WORKSPACE
ARG VITE_PUBLIC_API_URL=/api
ARG VITE_ADMIN_API_URL=/api

ENV VITE_PUBLIC_API_URL=${VITE_PUBLIC_API_URL}
ENV VITE_ADMIN_API_URL=${VITE_ADMIN_API_URL}

RUN case "$FRONTEND_WORKSPACE" in \
      frontend-public|frontend-admin) ;; \
      *) echo "Unsupported frontend workspace: $FRONTEND_WORKSPACE" >&2; exit 1 ;; \
    esac \
    && npm run build:production --workspace "$FRONTEND_WORKSPACE" \
    && node ops/frontend/verify-build.mjs "$FRONTEND_WORKSPACE"

FROM nginx:1.28-alpine

ARG FRONTEND_WORKSPACE

COPY ops/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/${FRONTEND_WORKSPACE}/dist/ /usr/share/nginx/html/

USER nginx

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]
