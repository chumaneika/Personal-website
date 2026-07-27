# syntax=docker/dockerfile:1

FROM caddy:2.11.4-alpine

RUN addgroup -S -g 10001 caddy \
    && adduser -S -D -H -u 10001 -G caddy caddy \
    && chown -R caddy:caddy /data /config

COPY --chown=caddy:caddy ops/reverse-proxy/Caddyfile /etc/caddy/Caddyfile

USER caddy

ENTRYPOINT ["caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
