# syntax=docker/dockerfile:1

FROM node:22.23.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend-public/package.json frontend-public/package.json
COPY frontend-admin/package.json frontend-admin/package.json

RUN npm ci

COPY frontend-public frontend-public

ARG VITE_PUBLIC_API_URL=/api
ARG VITE_PUBLIC_SENTRY_DSN=
ARG VITE_SENTRY_ENVIRONMENT=production
ARG VITE_RELEASE=

ENV VITE_PUBLIC_API_URL=${VITE_PUBLIC_API_URL}
ENV VITE_PUBLIC_SENTRY_DSN=${VITE_PUBLIC_SENTRY_DSN}
ENV VITE_SENTRY_ENVIRONMENT=${VITE_SENTRY_ENVIRONMENT}
ENV VITE_RELEASE=${VITE_RELEASE}

RUN npm run build:production --workspace @personal-website/frontend-public

FROM node:22.23.1-alpine AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend-public/package.json frontend-public/package.json
COPY frontend-admin/package.json frontend-admin/package.json

RUN npm ci --omit=dev --workspace @personal-website/frontend-public --include-workspace-root \
    && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --from=build /app/frontend-public/build frontend-public/build

WORKDIR /app/frontend-public

USER node

EXPOSE 8080

CMD ["node", "node_modules/@react-router/serve/bin.cjs", "build/server/index.js"]
