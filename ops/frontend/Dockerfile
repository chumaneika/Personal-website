# syntax=docker/dockerfile:1

FROM node:26.5.1-alpine AS build

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
ARG VITE_PUBLIC_SENTRY_DSN=
ARG VITE_ADMIN_SENTRY_DSN=
ARG VITE_SENTRY_ENVIRONMENT=production
ARG VITE_RELEASE=

ENV VITE_PUBLIC_API_URL=${VITE_PUBLIC_API_URL}
ENV VITE_ADMIN_API_URL=${VITE_ADMIN_API_URL}
ENV VITE_PUBLIC_SENTRY_DSN=${VITE_PUBLIC_SENTRY_DSN}
ENV VITE_ADMIN_SENTRY_DSN=${VITE_ADMIN_SENTRY_DSN}
ENV VITE_SENTRY_ENVIRONMENT=${VITE_SENTRY_ENVIRONMENT}
ENV VITE_RELEASE=${VITE_RELEASE}

RUN case "$FRONTEND_WORKSPACE" in \
      frontend-public|frontend-admin) ;; \
      *) echo "Unsupported frontend workspace: $FRONTEND_WORKSPACE" >&2; exit 1 ;; \
    esac \
    && npm run build:production --workspace "$FRONTEND_WORKSPACE" \
    && node ops/frontend/verify-build.mjs "$FRONTEND_WORKSPACE"

FROM nginx:1.31.3-alpine3.24

ARG FRONTEND_WORKSPACE

COPY ops/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/${FRONTEND_WORKSPACE}/dist/ /usr/share/nginx/html/

USER nginx

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]
