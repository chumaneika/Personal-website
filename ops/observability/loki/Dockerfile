# syntax=docker/dockerfile:1

FROM busybox:1.38.0-musl AS healthcheck

FROM grafana/loki:3.7.4

COPY --from=healthcheck /bin/busybox /bin/busybox
