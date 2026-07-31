# syntax=docker/dockerfile:1

FROM golang:1.26.5-alpine3.24 AS build

WORKDIR /src

COPY ops/reverse-proxy/custom-caddy/ ./

RUN CGO_ENABLED=0 go build -mod=mod -trimpath -ldflags="-s -w" -o /usr/bin/caddy .

FROM caddy:2.11.4-alpine

RUN apk upgrade --no-cache \
    && addgroup -S -g 10001 caddy \
    && adduser -S -D -H -u 10001 -G caddy caddy \
    && chown -R caddy:caddy /data /config

COPY --from=build /usr/bin/caddy /usr/bin/caddy
COPY --chown=caddy:caddy ops/reverse-proxy/Caddyfile /etc/caddy/Caddyfile

USER caddy

ENTRYPOINT ["caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
