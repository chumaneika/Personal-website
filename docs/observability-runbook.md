# Observability: эксплуатация и реагирование

## Состав стека

- Spring Boot Actuator публикует внутренние `liveness`, `readiness` и
  Prometheus-метрики на порту backend `8080`. Эти endpoints не публикуются на
  host и доступны только сервисам в Docker-сетях.
- Prometheus собирает backend-метрики, проверяет health endpoints через
  Blackbox Exporter и вычисляет правила доступности, HTTP 5xx и p95 latency.
- Blackbox Exporter проверяет реальные публичные HTTPS URL, поэтому контроль
  включает DNS, TLS, Caddy и frontend.
- Alertmanager группирует алерты и отправляет firing/resolved события в generic
  webhook. URL читается только из Docker secret.
- Grafana Alloy находит контейнеры Compose через Docker API и отправляет их
  stdout/stderr в Loki с метками `project`, `service`, `container`, `stream` и
  `environment`.
- Loki хранит логи 30 дней. Prometheus по умолчанию хранит метрики 30 дней.
- Grafana автоматически получает Prometheus/Loki datasources и dashboard
  `Personal website overview`.
- Sentry SDK отдельно собирает исключения backend и browser errors frontend.
  Пустой DSN безопасно отключает соответствующий SDK.

Это single-host решение. Оно подходит для одного deployment host, но само не
является highly available: отказ всего host одновременно остановит мониторинг.
Для строгого внешнего SLA запускайте дополнительную проверку из другой
инфраструктуры.

## Подготовка

1. Скопируйте `.env.example` в ignored `.env` и задайте production URL:

   ```env
   PUBLIC_SITE_PROBE_URL=https://www.example.com/
   ADMIN_SITE_PROBE_URL=https://admin.example.com/login
   OBSERVABILITY_ENVIRONMENT=production
   ```

2. В каталоге `APP_SECRETS_DIRECTORY` создайте два дополнительных файла:

   - `GRAFANA_ADMIN_PASSWORD` — уникальный пароль Grafana;
   - `ALERTMANAGER_WEBHOOK_URL` — полный HTTPS URL сервиса, принимающего
     стандартный Alertmanager webhook JSON.

   Не используйте обычный Slack/Teams incoming webhook без совместимого
   Alertmanager adapter: формат payload отличается.

   ```bash
   chmod 700 "${APP_SECRETS_DIRECTORY}"
   chmod 600 \
     "${APP_SECRETS_DIRECTORY}/GRAFANA_ADMIN_PASSWORD" \
     "${APP_SECRETS_DIRECTORY}/ALERTMANAGER_WEBHOOK_URL"
   ```

3. Для Sentry создайте разные проекты для backend, public frontend и admin
   frontend. Заполните `SENTRY_DSN`, `VITE_PUBLIC_SENTRY_DSN` и
   `VITE_ADMIN_SENTRY_DSN`. Значения `VITE_*` встраиваются при сборке, поэтому
   после их изменения frontend-образы необходимо пересобрать.

4. Перед запуском проверьте итоговую модель Compose:

   ```bash
   docker compose config --quiet
   ```

## Запуск и доступ

Запустите приложение вместе со стеком наблюдаемости:

```bash
docker compose up -d --build
docker compose ps
```

Grafana, Prometheus и Alertmanager по умолчанию слушают только
`127.0.0.1`. Для удалённой диагностики используйте SSH tunnel:

```bash
ssh -L 3000:127.0.0.1:3000 deploy@example-host
```

После этого откройте `http://127.0.0.1:3000`. Не меняйте
`OBSERVABILITY_BIND_ADDRESS` на `0.0.0.0` без firewall, TLS и отдельной
аутентификации.

## Проверка после деплоя

Релиз не считается завершённым, пока не подтверждены все три внешних канала:

- в backend, public frontend и admin frontend отправлены контролируемые тестовые
  события, и они появились в соответствующих Sentry projects с текущим
  `SENTRY_RELEASE`/`VITE_RELEASE`;
- тестовый Alertmanager alert доставлен в incident webhook, а затем получено
  resolved-событие;
- независимый uptime-monitor, запущенный вне deployment host, успешно проверяет
  public homepage и admin login по HTTPS.

Локальный Blackbox Exporter проверяет DNS/TLS и страницы, но не обнаружит отказ
всего deployment host. Поэтому он не заменяет внешний uptime-monitor.

Проверьте состояние компонентов:

```bash
docker compose ps
curl --fail http://127.0.0.1:9090/-/ready
curl --fail http://127.0.0.1:9093/-/ready
curl --fail http://127.0.0.1:3000/api/health
```

Проверьте backend из сети Prometheus:

```bash
docker compose exec prometheus \
  wget -qO- http://backend:8080/actuator/health/liveness
docker compose exec prometheus \
  wget -qO- http://backend:8080/actuator/health/readiness
docker compose exec prometheus \
  wget -qO- http://backend:8080/actuator/prometheus
```

Оба health endpoints должны вернуть HTTP 200 и `status: UP`. Readiness включает
проверку PostgreSQL; liveness не зависит от базы.

В Prometheus откройте `Status -> Targets`: все targets должны быть `UP`. В
Grafana проверьте dashboard и Explore. Примеры LogQL:

```logql
{project="personal-website"}
```

```logql
{project="personal-website", service="backend"} | json | level="ERROR"
```

```logql
{project="personal-website"} |~ "(?i)(error|exception|fatal)"
```

Отправьте тестовый алерт и убедитесь, что webhook получил firing, а затем
resolved событие:

```bash
docker compose exec alertmanager amtool \
  --alertmanager.url=http://127.0.0.1:9093 \
  alert add alertname=ObservabilitySmokeTest severity=warning service=manual
```

Одноразовый тест перестанет обновляться и будет автоматически разрешён по
`resolve_timeout` Alertmanager (по умолчанию в этом проекте — пять минут).

## Настроенные алерты

| Алерт                              | Условие                                            | Severity |
| ---------------------------------- | -------------------------------------------------- | -------- |
| `PublicSiteUnavailable`            | public/admin probe неуспешен 2 минуты              | critical |
| `PublicSiteSlow`                   | end-to-end probe дольше 3 секунд 10 минут          | warning  |
| `BackendMetricsUnavailable`        | Actuator scrape недоступен 2 минуты                | critical |
| `BackendLivenessFailed`            | liveness неуспешен 1 минуту                        | critical |
| `BackendReadinessFailed`           | readiness, включая PostgreSQL, неуспешен 1 минуту  | critical |
| `BackendHighErrorRate`             | 5xx больше 5% при заметном трафике 10 минут        | warning  |
| `BackendHighP95Latency`            | p95 больше 1 секунды при заметном трафике 10 минут | warning  |
| `ObservabilityTargetDown`          | компонент observability не scrape-ится 5 минут     | warning  |
| `PrometheusRuleEvaluationFailures` | ошибки вычисления правил 5 минут                   | warning  |

Пороговые значения хранятся в
`ops/observability/prometheus/rules/application.yml`. После изменения проверьте
правила и перезагрузите Prometheus:

```bash
docker compose exec prometheus \
  promtool check rules /etc/prometheus/rules/application.yml
curl --request POST http://127.0.0.1:9090/-/reload
```

## Site or backend is unavailable

1. Сравните внешний probe и внутренние liveness/readiness на dashboard.
2. Если внешний probe падает, а backend health успешен, проверьте DNS,
   сертификат, Caddy и frontend:

   ```bash
   curl --fail --show-error --verbose "${PUBLIC_SITE_PROBE_URL}"
   docker compose logs --since 15m edge-proxy frontend-public frontend-admin
   ```

3. Если readiness падает, проверьте PostgreSQL и backend:

   ```bash
   docker compose ps postgres backend
   docker compose logs --since 15m postgres backend
   ```

4. Если liveness падает, сохраните последние backend logs и перезапускайте
   сервис только после фиксации симптомов:

   ```bash
   docker compose logs --since 30m backend
   docker compose restart backend
   ```

## Latency or error rate is high

1. В dashboard определите время начала, request rate, p95 и 5xx ratio.
2. В Grafana Explore отфильтруйте backend JSON logs по `request_id`, `level` и
   времени инцидента; затем сопоставьте запрос с событием Sentry.
3. Сопоставьте событие с Sentry release и traces. Не отправляйте в тикет
   session cookie, пароль, DSN или другие секреты.
4. Проверьте PostgreSQL saturation/locks и внешние SMTP/HTTP зависимости, если
   медленный endpoint их использует.

## Observability component is down

```bash
docker compose ps prometheus alertmanager blackbox-exporter loki alloy grafana
docker compose logs --since 15m prometheus alertmanager blackbox-exporter loki alloy grafana
```

- Для Prometheus проверьте `Status -> Configuration`, `Targets` и `Rules`.
- Для Alloy проверьте ошибки доступа к `/var/run/docker.sock` и отправки в Loki.
- Для Loki проверьте свободное место Docker data root и volume `loki_data`.
- Для Alertmanager проверьте доступность webhook и отсутствие значения URL в
  логах. Не выводите содержимое secret-файла.

## Хранение и безопасность

- Docker `json-file` logs ротируются: 5 файлов по 10 MiB на контейнер. Loki
  хранит агрегированную копию 30 дней.
- Данные находятся в named volumes `prometheus_data`, `alertmanager_data`,
  `loki_data`, `alloy_data`, `grafana_data`; не удаляйте их при обычном релизе.
- Alloy монтирует Docker socket read-only. Socket всё равно является
  привилегированным API: запускайте только проверенный образ и не открывайте
  Alloy UI наружу.
- Loki работает без tenant auth и поэтому доступен только внутри monitoring
  network.
- Management endpoints backend не имеют host port и не маршрутизируются Caddy.
