# Personal Website

Монорепозиторий персонального сайта с публичным SSR-приложением, отдельной
административной панелью, REST API на Spring Boot и PostgreSQL.

Проект включает:

- публичный сайт на React Router 7 с server-side rendering;
- административную SPA на React и Vite;
- backend на Java 17, Spring Boot, Spring Security и Spring Data JPA;
- PostgreSQL 16 и миграции Flyway;
- OpenAPI 3 и Swagger UI через Springdoc;
- production-инфраструктуру на Docker Compose с Caddy, резервным копированием и
  полным стеком наблюдаемости.

## Архитектура

### Компоненты

| Компонент        | Каталог              | Назначение                                                                                 |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| Public frontend  | `frontend-public/`   | React Router Framework Mode, SSR через Node.js, публичные страницы, SEO и контактная форма |
| Admin frontend   | `frontend-admin/`    | Vite SPA для управления профилем, проектами, статьями, навыками и сообщениями              |
| Backend          | `springboot/`        | REST API, бизнес-логика, аутентификация, валидация, работа с PostgreSQL                    |
| Operations       | `ops/`               | Dockerfile, Caddy, Nginx, backup/restore и конфигурация observability                      |
| Deployment stack | `docker-compose.yml` | Production-сервисы, сети, volumes, secrets и health checks                                 |

```text
Браузер
  |
  v
Caddy :80/:443
  |-------------------------------|
  |                               |
  v                               v
Public Node SSR                Admin Nginx SPA
  |                               |
  |------------ /api -------------|
                  |
                  v
            Spring Boot API
                  |
                  v
             PostgreSQL 16
```

В production Caddy:

- направляет публичные `/api/*`, `/robots.txt` и `/sitemap.xml` в backend;
- направляет остальные публичные маршруты в Node SSR;
- обслуживает admin-домен через Nginx SPA;
- завершает TLS, перенаправляет HTTP на HTTPS и передаёт стандартные forwarded
  headers.

Public frontend получает данные двумя путями:

- SSR loaders обращаются к `PUBLIC_BACKEND_INTERNAL_URL` только на Node-сервере;
- браузерные запросы используют `VITE_PUBLIC_API_URL`, по умолчанию `/api`.

Admin frontend использует `VITE_ADMIN_API_URL`, по умолчанию `/api`. В локальном
режиме Vite проксирует `/api` на `http://localhost:8080`, поэтому CORS и cookie
работают через один origin frontend-приложения.

### Структура backend

Backend организован по слоям:

```text
controllers/   HTTP endpoints и DTO
services/      бизнес-правила и транзакции
repositories/  Spring Data JPA
entities/      отображение таблиц PostgreSQL
dto/           request/response-модели и mapper-классы
config/        Spring Security, CORS, filters и bootstrap/recovery администратора
exceptions/    единый формат ошибок API
events/        события приложения
```

Публичные endpoints находятся под `/api/*`, административные — под
`/api/admin/*`, а аутентификация — под `/api/auth/*`. Backend также публикует:

```text
/api/health
/actuator/health/liveness
/actuator/health/readiness
/actuator/prometheus
```

Actuator доступен только внутри application-сети в Compose. Readiness проверяет
соединение с PostgreSQL, а liveness не зависит от внешних сервисов.

### Backend и PostgreSQL

Основные backend-технологии:

- Java 17 и Spring Boot 3.5;
- Spring MVC, Validation, Security и server-side HTTP session;
- Spring Data JPA/Hibernate;
- PostgreSQL JDBC driver;
- Flyway для схемы БД;
- Actuator и Micrometer Prometheus;
- опциональные Sentry и SMTP-уведомления.

Схема содержит таблицы `users`, `profiles`, `projects`, `articles`,
`skill_category`, `skills` и `contact_messages`. Ограничения, уникальные ключи и
индексы определяются SQL-миграциями, а не Hibernate. В runtime используется
`spring.jpa.hibernate.ddl-auto=validate`: JPA проверяет схему, но не создаёт и
не изменяет её.

Аутентификация администратора основана на серверной сессии:

- логин отправляется только в `POST /api/auth/login`;
- идентификатор сессии хранится в HttpOnly cookie;
- изменяющие запросы требуют CSRF-токен из `GET /api/auth/csrf`;
- попытки входа ограничиваются по адресу клиента;
- logout и смена пароля инвалидируют сессию;
- пароль и authorization header не сохраняются в browser storage.

## Документация API

Полное описание публичных и административных endpoints, формата ошибок,
session/CSRF-авторизации и правил версионирования:
[docs/api.md](docs/api.md).

При локальном запуске backend доступны:

```text
Swagger UI:   http://localhost:8080/swagger-ui.html
OpenAPI JSON: http://localhost:8080/v3/api-docs
OpenAPI YAML: http://localhost:8080/v3/api-docs.yaml
```

Спецификация описывает только `/api/**`. В production profile и Docker Compose
Swagger/OpenAPI выключены по умолчанию. Их включение контролируют
`SPRINGDOC_API_DOCS_ENABLED` и `SPRINGDOC_SWAGGER_UI_ENABLED`; production proxy
намеренно не публикует эти URL наружу.

## Требования

| Инструмент     | Требуемая версия              | Где зафиксирована                |
| -------------- | ----------------------------- | -------------------------------- |
| Java           | Temurin `17.0.19+10`          | `.java-version`                  |
| Node.js        | `22.17.1`                     | `.nvmrc`, `package.json`         |
| npm            | Совместимый с Node 22         | `package-lock.json` версии 3     |
| PostgreSQL     | `16`                          | Compose и Testcontainers         |
| Docker         | Актуальный Docker Engine      | Локальная БД, тесты и deployment |
| Docker Compose | Compose v2 (`docker compose`) | `docker-compose.yml`             |

Maven отдельно устанавливать не нужно: backend использует Maven Wrapper
`springboot/mvnw`.

Проверьте окружение:

```bash
java -version
node --version
npm --version
docker --version
docker compose version
```

Для Node.js удобно использовать nvm:

```bash
nvm install
nvm use
```

JDK должен быть Java 17. Более новая установленная Java может компилировать
проект, но локальное и CI-окружение должны совпадать с `.java-version`.

## Полный локальный запуск

Ниже приведён рекомендуемый dev-сценарий: PostgreSQL работает в Docker, а
backend и оба frontend-приложения запускаются на хосте с hot reload.

### 1. Установить frontend-зависимости

Из корня репозитория:

```bash
npm ci
```

`npm ci` устанавливает зависимости обоих npm workspaces строго по
`package-lock.json`.

### 2. Запустить PostgreSQL 16

Первый запуск:

```bash
docker run --name personal-website-postgres-dev \
  --detach \
  --publish 5432:5432 \
  --env POSTGRES_DB=users_db \
  --env POSTGRES_USER=postgres-user \
  --env POSTGRES_PASSWORD=local-db-password \
  --volume personal-website-postgres-dev:/var/lib/postgresql/data \
  postgres:16-alpine
```

При следующих запусках:

```bash
docker start personal-website-postgres-dev
```

Проверка:

```bash
docker exec personal-website-postgres-dev \
  pg_isready -U postgres-user -d users_db
```

Если порт `5432` занят, используйте `--publish 5433:5432` и укажите порт `5433`
в `SPRING_DATASOURCE_URL`.

### 3. Подготовить локальные secrets

Храните secrets вне репозитория. Например, создайте соседний каталог:

```bash
DEV_SECRETS_DIR="$(cd .. && pwd)/personal-website-secrets-dev"
install -d -m 700 "$DEV_SECRETS_DIR"
printf '%s' 'local-db-password' \
  > "$DEV_SECRETS_DIR/SPRING_DATASOURCE_PASSWORD"
printf '%s' 'local-admin-password-123' \
  > "$DEV_SECRETS_DIR/APP_ADMIN_PASSWORD"
touch "$DEV_SECRETS_DIR/APP_ADMIN_RECOVERY_PASSWORD"
touch "$DEV_SECRETS_DIR/SPRING_MAIL_PASSWORD"
chmod 600 "$DEV_SECRETS_DIR"/*
```

Пароль администратора должен содержать от 12 до 128 символов, хотя бы одну
букву и одну цифру.

### 4. Создать корневой `.env`

Создайте `.env` в корне репозитория. Замените значение
`APP_SECRETS_DIRECTORY` на абсолютный путь из предыдущего шага:

```env
APP_SECRETS_DIRECTORY=/absolute/path/to/personal-website-secrets-dev/

SPRING_PROFILES_ACTIVE=local
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/users_db
SPRING_DATASOURCE_USERNAME=postgres-user
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_FLYWAY_BASELINE_ON_MIGRATE=false

APP_SERVER_ADDRESS=127.0.0.1
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
APP_SESSION_COOKIE_SECURE=false
APP_SESSION_COOKIE_SAME_SITE=lax
APP_SECURITY_REQUIRE_HTTPS=false

APP_ADMIN_INITIALIZER_ENABLED=true
APP_ADMIN_EMAIL=admin@example.com

SENTRY_ENABLED=false

SPRINGDOC_API_DOCS_ENABLED=true
SPRINGDOC_SWAGGER_UI_ENABLED=true
```

Профиль `local` использует базовый `application.yaml` и, в отличие от `prod`,
не требует HTTPS и Secure cookie. Не используйте production-профиль для
обычного запуска через `http://localhost`.

Spring Boot загружает корневой `.env` благодаря
`optional:file:../.env[.properties]`, когда backend запускается из каталога
`springboot`. Для прямого запуска оставляйте завершающий `/` в
`APP_SECRETS_DIRECTORY`: Spring импортирует этот путь как config tree.

### 5. Запустить backend

В первом терминале:

```bash
cd springboot
./mvnw spring-boot:run
```

При старте Flyway автоматически применит все миграции. Проверка:

```bash
curl --fail http://localhost:8080/api/health
curl --fail http://localhost:8080/actuator/health/readiness
```

После старта Swagger UI доступен на
<http://localhost:8080/swagger-ui.html>.

После первого успешного запуска и создания администратора:

1. измените `APP_ADMIN_INITIALIZER_ENABLED=true` на `false` в `.env`;
2. очистите файл `APP_ADMIN_PASSWORD`;
3. перезапустите backend.

```bash
printf '' > "$DEV_SECRETS_DIR/APP_ADMIN_PASSWORD"
```

Если initializer оставить включённым после создания пользователя, следующий
старт завершится ошибкой намеренно.

### 6. Запустить frontend-приложения

Во втором терминале, из корня:

```bash
npm run dev:public
```

В третьем терминале:

```bash
npm run dev:admin
```

Приложения будут доступны по адресам:

- public: <http://localhost:5173>;
- admin: <http://localhost:5174>;
- backend: <http://localhost:8080>.

Для стандартного локального запуска frontend `.env` не нужен: SSR и Vite proxy
уже используют `localhost:8080`. Файлы `frontend-public/.env.example` и
`frontend-admin/.env.example` нужны только для переопределения API URL, Sentry
или release metadata.

### 7. Остановить локальную БД

```bash
docker stop personal-website-postgres-dev
```

Данные сохраняются в Docker volume `personal-website-postgres-dev`.

## Переменные окружения

Полный шаблон production-конфигурации находится в `.env.example`. Файл `.env`
игнорируется Git и используется Docker Compose и Spring Boot. Frontend-переменные
для прямого запуска находятся в `frontend-public/.env.example` и
`frontend-admin/.env.example`.

### Где и когда читаются значения

- Spring Boot читает `springboot/.env`, затем корневой `.env` и config tree из
  `APP_SECRETS_DIRECTORY`.
- Docker Compose читает корневой `.env`.
- `VITE_*` встраиваются в браузерный bundle во время сборки и не являются
  secrets.
- `PUBLIC_BACKEND_INTERNAL_URL`, `PUBLIC_SITE_ORIGIN`, `HOST` и `PORT` читаются
  Node SSR-процессом во время запуска.
- Изменение `VITE_*` требует новой сборки frontend-образа.

### Deployment и маршрутизация

| Переменная                                            | Назначение                                                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `RELEASE_VERSION`                                     | Неизменяемый общий тег application-образов одного релиза                                        |
| `APP_SECRETS_DIRECTORY`                               | Абсолютный путь к внешнему каталогу secret-файлов; для прямого Spring-запуска с завершающим `/` |
| `PUBLIC_DOMAIN`, `ADMIN_DOMAIN`                       | Публичный и административный DNS-адреса для Caddy                                               |
| `ACME_EMAIL`                                          | Email для ACME и автоматического выпуска TLS-сертификатов                                       |
| `REVERSE_PROXY_BIND_ADDRESS`                          | Адрес публикации Caddy, по умолчанию `0.0.0.0`                                                  |
| `REVERSE_PROXY_HTTP_PORT`, `REVERSE_PROXY_HTTPS_PORT` | Host-порты Caddy, по умолчанию `80` и `443`                                                     |
| `PUBLIC_FRONTEND_API_URL`, `ADMIN_FRONTEND_API_URL`   | Compose build args, преобразуемые в соответствующие `VITE_*_API_URL`; рекомендуется `/api`      |
| `PUBLIC_BACKEND_INTERNAL_URL`                         | Приватный абсолютный URL API для public SSR; в Compose `http://backend:8080/api`                |
| `PUBLIC_SITE_ORIGIN`                                  | Внешний origin public-сайта для canonical URL и metadata                                        |
| `APP_SERVER_ADDRESS`                                  | Адрес, на котором слушает backend; Compose принудительно задаёт `0.0.0.0`                       |
| `SPRING_PROFILES_ACTIVE`                              | Активный Spring profile; в production — `prod`                                                  |

### PostgreSQL, JPA, Flyway и backups

| Переменная                                   | Назначение                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `SPRING_DATASOURCE_URL`                      | JDBC URL PostgreSQL                                                    |
| `SPRING_DATASOURCE_USERNAME`                 | Пользователь backend-подключения                                       |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME`        | JDBC driver, обычно `org.postgresql.Driver`                            |
| `SPRING_DATASOURCE_PASSWORD`                 | Пароль datasource; в production поступает из одноимённого secret-файла |
| `POSTGRES_DB`, `POSTGRES_USER`               | База и пользователь, создаваемые образом PostgreSQL                    |
| `SPRING_JPA_HIBERNATE_DDL_AUTO`              | Режим Hibernate; рабочее значение `validate`                           |
| `SPRING_JPA_SHOW_SQL`                        | Вывод SQL Hibernate                                                    |
| `SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL` | Форматирование SQL в логах                                             |
| `SPRING_FLYWAY_BASELINE_ON_MIGRATE`          | Одноразовый baseline старой схемы; обычно всегда `false`               |
| `POSTGRES_BACKUP_DIRECTORY`                  | Каталог backup на хосте, по умолчанию `./backups/postgres`             |
| `POSTGRES_BACKUP_INTERVAL_SECONDS`           | Интервал автоматического backup, по умолчанию `86400`                  |
| `POSTGRES_BACKUP_RETRY_SECONDS`              | Задержка повтора после ошибки, по умолчанию `300`                      |
| `POSTGRES_BACKUP_RETENTION_DAYS`             | Срок хранения backup, по умолчанию `14` дней                           |

### Администратор и security

| Переменная                                               | Назначение                                        |
| -------------------------------------------------------- | ------------------------------------------------- |
| `APP_ADMIN_INITIALIZER_ENABLED`, `APP_ADMIN_EMAIL`       | Одноразовое создание администратора               |
| `APP_ADMIN_RECOVERY_ENABLED`, `APP_ADMIN_RECOVERY_EMAIL` | Одноразовое восстановление пароля при старте      |
| `APP_ADMIN_PASSWORD`                                     | Bootstrap-пароль из внешнего secret-файла         |
| `APP_ADMIN_RECOVERY_PASSWORD`                            | Recovery-пароль из внешнего secret-файла          |
| `APP_CORS_ALLOWED_ORIGINS`                               | Точный список разрешённых origins через запятую   |
| `APP_SESSION_TIMEOUT`                                    | Время жизни HTTP session, по умолчанию `30m`      |
| `APP_SESSION_COOKIE_SECURE`                              | Отправлять session cookie только по HTTPS         |
| `APP_SESSION_COOKIE_SAME_SITE`                           | Политика SameSite; production использует `strict` |
| `APP_SECURITY_REQUIRE_HTTPS`                             | Требовать безопасный протокол                     |
| `APP_LOGIN_MAX_ATTEMPTS`                                 | Максимум неудачных попыток входа в окне           |
| `APP_LOGIN_ATTEMPT_WINDOW`                               | Окно подсчёта попыток входа                       |
| `APP_LOGIN_BLOCK_DURATION`                               | Длительность блокировки после превышения лимита   |

Production profile принудительно включает HTTPS, HSTS, Secure/HttpOnly cookie,
`SameSite=Strict`, скрытие деталей ошибок и graceful shutdown.

### Контактная форма и email

| Переменная                                                     | Назначение                                         |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `APP_CONTACT_MAX_REQUEST_BYTES`                                | Максимальный размер запроса, по умолчанию `16384`  |
| `APP_CONTACT_DUPLICATE_WINDOW`                                 | Период блокировки дубликата email + message        |
| `APP_CONTACT_RATE_LIMIT_MAX_SUBMISSIONS`                       | Максимум отправок с одного IP за окно              |
| `APP_CONTACT_RATE_LIMIT_WINDOW`                                | Окно rate limit                                    |
| `APP_CONTACT_RETENTION_ENABLED`                                | Включить архивирование и удаление старых сообщений |
| `APP_CONTACT_RETENTION_CRON`                                   | Cron задачи retention                              |
| `APP_CONTACT_ARCHIVE_READ_AFTER`                               | Через сколько архивировать прочитанные сообщения   |
| `APP_CONTACT_DELETE_ARCHIVED_AFTER`                            | Через сколько удалять архивные сообщения           |
| `APP_CONTACT_EMAIL_NOTIFICATIONS_ENABLED`                      | Включить асинхронное SMTP-уведомление              |
| `APP_CONTACT_EMAIL_FROM`, `APP_CONTACT_EMAIL_TO`               | Отправитель и получатель уведомления               |
| `APP_CONTACT_EMAIL_SUBJECT`                                    | Тема письма                                        |
| `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME` | SMTP-подключение                                   |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH`                        | SMTP authentication                                |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE`             | Включить STARTTLS                                  |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_REQUIRED`           | Требовать STARTTLS                                 |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_SSL_CHECKSERVERIDENTITY`     | Проверять hostname TLS-сертификата                 |
| `SPRING_MAIL_PASSWORD`                                         | SMTP-пароль из внешнего secret-файла               |

Контактная форма дополнительно использует honeypot, проверку дубликатов и
ограничение размера до JSON parsing. Ошибка SMTP логируется, но не откатывает
сохранённое сообщение.

### Sentry и observability

| Переменная                                        | Назначение                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `SENTRY_DSN`, `SENTRY_ENABLED`                    | Backend Sentry DSN и включение SDK                                          |
| `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`            | Backend environment и release                                               |
| `SENTRY_TRACES_SAMPLE_RATE`                       | Доля backend traces                                                         |
| `VITE_PUBLIC_SENTRY_DSN`, `VITE_ADMIN_SENTRY_DSN` | Публичные client DSN двух frontend-приложений                               |
| `VITE_SENTRY_ENVIRONMENT`, `VITE_RELEASE`         | Frontend environment и release, встраиваемые при build                      |
| `OBSERVABILITY_BIND_ADDRESS`                      | Адрес host-портов Grafana/Prometheus/Alertmanager; по умолчанию `127.0.0.1` |
| `OBSERVABILITY_ENVIRONMENT`                       | Environment label для метрик и логов                                        |
| `GRAFANA_PORT`, `GRAFANA_ADMIN_USER`              | Порт и имя администратора Grafana                                           |
| `PROMETHEUS_PORT`, `PROMETHEUS_RETENTION_TIME`    | Порт и срок хранения Prometheus                                             |
| `ALERTMANAGER_PORT`                               | Локальный порт Alertmanager                                                 |
| `PUBLIC_SITE_PROBE_URL`, `ADMIN_SITE_PROBE_URL`   | Внешние HTTPS URL для Blackbox Exporter                                     |

Пустой Sentry DSN отключает отправку событий. Для production создавайте разные
Sentry projects для backend, public frontend и admin frontend.

### OpenAPI

| Переменная                     | Назначение                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| `SPRINGDOC_API_DOCS_ENABLED`   | Включает OpenAPI JSON/YAML; локально `true`, в production `false` |
| `SPRINGDOC_SWAGGER_UI_ENABLED` | Включает Swagger UI; локально `true`, в production `false`        |

### Frontend-переменные при прямом запуске

| Переменная                                        | Приложение               | Назначение                        |
| ------------------------------------------------- | ------------------------ | --------------------------------- |
| `VITE_PUBLIC_API_URL`                             | Public browser bundle    | API base URL, по умолчанию `/api` |
| `PUBLIC_BACKEND_INTERNAL_URL`                     | Public Node SSR          | Абсолютный API URL для loaders    |
| `PUBLIC_SITE_ORIGIN`                              | Public Node SSR          | Origin для SEO metadata           |
| `VITE_ADMIN_API_URL`                              | Admin browser bundle     | API base URL, по умолчанию `/api` |
| `VITE_PUBLIC_SENTRY_DSN`, `VITE_ADMIN_SENTRY_DSN` | Соответствующий frontend | Sentry DSN                        |
| `VITE_SENTRY_ENVIRONMENT`, `VITE_RELEASE`         | Оба frontend             | Sentry metadata                   |
| `HOST`, `PORT`                                    | Public Node SSR          | Runtime bind address и port       |

Дополнительные редкие настройки backend:
`LOGGING_STRUCTURED_FORMAT_CONSOLE` выбирает формат console logs, а
`SERVER_FORWARD_HEADERS_STRATEGY` управляет обработкой forwarded headers.

### Внешние secret-файлы

Compose ожидает в `APP_SECRETS_DIRECTORY` ровно эти файлы:

```text
SPRING_DATASOURCE_PASSWORD
APP_ADMIN_PASSWORD
APP_ADMIN_RECOVERY_PASSWORD
SPRING_MAIL_PASSWORD
GRAFANA_ADMIN_PASSWORD
ALERTMANAGER_WEBHOOK_URL
```

Docker Compose монтирует только нужные файлы каждого сервиса в `/run/secrets`.
Значения не попадают в Compose environment, `.env`, image layers или Git.

## Сборка и тестирование

### Frontend

Установка:

```bash
npm ci
```

Основные команды:

```bash
npm run dev:public
npm run dev:admin
npm run build:public
npm run build:admin
npm run build
npm run test
npm run test:watch
npm run test:e2e
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

Полный frontend quality gate:

```bash
npm run quality
```

Он последовательно запускает Prettier check, ESLint без warnings, TypeScript,
Vitest и production build обоих приложений.

Browser E2E smoke-тесты запускаются отдельно через `npm run test:e2e`. Они
поднимают backend, public и admin frontend и проверяют контактную форму, вход
администратора, публикацию проекта и logout. Для локального запуска нужен
PostgreSQL на `127.0.0.1:5432` с базой и пользователем
`personal_website_e2e`; значения подключения можно переопределить переменными
`SPRING_DATASOURCE_*`.

Результаты сборки:

```text
frontend-public/build/server   Node SSR bundle
frontend-public/build/client   browser assets
frontend-admin/dist            статическая admin SPA
```

Локальная проверка production runtime public frontend:

```bash
npm run build:public
cd frontend-public
PUBLIC_BACKEND_INTERNAL_URL=http://localhost:8080/api \
PUBLIC_SITE_ORIGIN=http://localhost:3000 \
PORT=3000 npm run start
```

### Backend

Из каталога `springboot`:

```bash
./mvnw test
./mvnw clean package
./mvnw spring-boot:run
```

`clean package` запускает тесты и создаёт executable jar в `springboot/target`.
Сборка без тестов, аналогичная build stage Dockerfile:

```bash
./mvnw -DskipTests package
```

Полный `./mvnw test` использует H2 в PostgreSQL compatibility mode. Если Docker
доступен, Testcontainers дополнительно запускает PostgreSQL 16. Явная проверка
реальной PostgreSQL и миграций:

```bash
./mvnw -Dtest=PostgreSqlMigrationIntegrationTests test
```

### Docker

```bash
docker compose config --quiet
docker compose build
docker compose build frontend-public frontend-admin backend edge-proxy
```

CI на push и pull request в `main` запускает frontend quality, независимые
frontend builds, backend tests, PostgreSQL migration tests, Chromium E2E smoke,
Gitleaks по полной Git-истории и сборку всех deployment-образов. Итоговый
обязательный check называется `CI / Required`.

## Docker Compose

`docker-compose.yml` предназначен для production-подобного запуска с реальными
DNS-именами и TLS. Он не публикует PostgreSQL и backend на host; снаружи доступны
только Caddy и loopback-порты observability.

### Сервисы

- `edge-proxy` — Caddy и автоматический TLS;
- `frontend-public` — Node.js SSR;
- `frontend-admin` — Nginx SPA;
- `backend` — Spring Boot;
- `postgres` — PostgreSQL 16;
- `postgres-backup` — периодический `pg_dump`;
- `prometheus`, `alertmanager`, `blackbox-exporter`;
- `grafana`, `loki`, `alloy`.

PostgreSQL находится только во внутренней сети `database`. Backend соединяет
сети `application` и `database`. Caddy и frontend находятся в `edge`, а
observability-компоненты — в `monitoring`.

Health checks обоих frontend обращаются к backend
`/actuator/health/readiness`, поэтому frontend считается healthy только при
доступных backend и PostgreSQL. Public SEO metadata использует
`frontend-public/public/og-default.png` как общий Open Graph/Twitter preview,
когда у проекта или статьи нет собственной обложки.

### Настройка

1. Скопируйте шаблон:

   ```bash
   cp .env.example .env
   ```

2. Установите уникальный `RELEASE_VERSION`, реальные домены, ACME email,
   PostgreSQL-настройки, CORS origins, site origins и probe URL.

3. Создайте внешний каталог secrets:

   ```bash
   install -d -m 700 /secure/path/personal-website-secrets
   openssl rand -hex 32 | tr -d '\n' \
     > /secure/path/personal-website-secrets/SPRING_DATASOURCE_PASSWORD
   openssl rand -hex 32 | tr -d '\n' \
     > /secure/path/personal-website-secrets/GRAFANA_ADMIN_PASSWORD
   touch /secure/path/personal-website-secrets/APP_ADMIN_PASSWORD
   touch /secure/path/personal-website-secrets/APP_ADMIN_RECOVERY_PASSWORD
   touch /secure/path/personal-website-secrets/SPRING_MAIL_PASSWORD
   printf '%s' 'https://alerts.example.com/alertmanager' \
     > /secure/path/personal-website-secrets/ALERTMANAGER_WEBHOOK_URL
   chmod 600 /secure/path/personal-website-secrets/*
   ```

4. Укажите абсолютный путь:

   ```env
   APP_SECRETS_DIRECTORY=/secure/path/personal-website-secrets/
   ```

5. Проверьте итоговую конфигурацию и запустите stack:

   ```bash
   docker compose config --quiet
   docker compose up --build -d
   docker compose ps
   ```

6. Проверьте endpoints:

   ```bash
   curl --fail "https://${PUBLIC_DOMAIN}/api/health"
   curl --fail "https://${PUBLIC_DOMAIN}/healthz"
   curl --fail "https://${PUBLIC_DOMAIN}/"
   curl --fail "https://${ADMIN_DOMAIN}/login"
   ```

Логи:

```bash
docker compose logs --tail 200 backend edge-proxy
docker compose logs --follow backend frontend-public frontend-admin
```

Остановка:

```bash
docker compose down
```

Обычный `down` сохраняет named volumes. Не используйте `docker compose down -v`
в production: эта команда удаляет persistent data, включая PostgreSQL, Caddy,
Prometheus, Loki и Grafana.

## Миграции базы данных

Flyway автоматически применяет миграции из
`springboot/src/main/resources/db/migration` при каждом старте backend.

Текущая последовательность:

| Версия | Файл                                       | Изменение                                       |
| ------ | ------------------------------------------ | ----------------------------------------------- |
| V1     | `V1__initial_schema.sql`                   | Исходные таблицы и sequence                     |
| V2     | `V2__add_constraints_and_indexes.sql`      | CHECK constraints и основные индексы            |
| V3     | `V3__index_contact_message_duplicates.sql` | Индекс для проверки дубликатов контактной формы |
| V4     | `V4__add_modern_image_urls.sql`            | URL для AVIF/WebP изображений                   |

Правила:

1. Создавайте новый файл `V<N>__short_description.sql`.
2. Никогда не редактируйте уже применённую миграцию.
3. Делайте миграции forward-only и безопасными для существующих данных.
4. Проверяйте constraints, индексы и совместимость JPA entities.
5. Запускайте тест с реальной PostgreSQL:

   ```bash
   cd springboot
   ./mvnw -Dtest=PostgreSqlMigrationIntegrationTests test
   ```

Применённые версии записываются Flyway в `flyway_schema_history`. Hibernate
после миграции выполняет `ddl-auto=validate`; несовпадение схемы останавливает
приложение.

`SPRING_FLYWAY_BASELINE_ON_MIGRATE=false` должно оставаться выключенным для
обычных и новых баз. Включайте его только один раз при принятии существующей
до-Flyway схемы на baseline version 1, затем немедленно возвращайте `false`.

`flyway clean` отключён. SQL downgrade-миграции не используются: исправление
схемы выполняется новой forward-миграцией. Откат application-образов и
восстановление PostgreSQL описаны в
[инструкции отката](docs/release-rollback.md).

## Production deployment

Текущий deployment рассчитан на один Docker host. Репозиторий содержит CI, но
не содержит автоматической публикации образов или CD: production-команды
выполняются на целевом сервере.

### Подготовка сервера

- Установите Docker Engine и Docker Compose v2.
- Направьте A/AAAA записи `PUBLIC_DOMAIN` и `ADMIN_DOMAIN` на сервер.
- Разрешите TCP `80`, TCP `443` и UDP `443`.
- Оставьте Grafana, Prometheus и Alertmanager на
  `OBSERVABILITY_BIND_ADDRESS=127.0.0.1`; используйте SSH tunnel.
- Разместите `.env` и внешний каталог secrets с правами `700/600`.
- Не храните secrets в репозитории, `.env`, environment контейнеров или images.
- Оставьте Swagger/OpenAPI выключенными, если для них не настроен отдельный
  доверенный доступ.

### Выпуск релиза

1. Выберите новый неизменяемый тег:

   ```env
   RELEASE_VERSION=2026.07.29-1
   SENTRY_RELEASE=2026.07.29-1
   VITE_RELEASE=2026.07.29-1
   SPRING_PROFILES_ACTIVE=prod
   ```

2. До применения миграций создайте backup:

   ```bash
   docker compose run --rm --entrypoint /bin/sh postgres-backup \
     /scripts/backup.sh
   ```

3. Проверьте конфигурацию, соберите образы и обновите stack:

   ```bash
   docker compose config --quiet
   docker compose build --pull
   docker compose up -d --remove-orphans
   ```

4. Дождитесь healthy-состояния:

   ```bash
   docker compose ps
   docker compose logs --since 10m backend edge-proxy
   ```

5. Проверьте public, admin, API, login, контактную форму, логи и dashboard:

   ```bash
   curl --fail "https://${PUBLIC_DOMAIN}/api/health"
   curl --fail "https://${PUBLIC_DOMAIN}/"
   curl --fail "https://${ADMIN_DOMAIN}/login"
   ```

Flyway запускается вместе с backend до успешной readiness-проверки. Caddy
автоматически выпускает и обновляет сертификаты; volumes `caddy_data` и
`caddy_config` нельзя удалять при обычном release.

### Первый production-администратор

1. Запишите сильный одноразовый пароль в `APP_ADMIN_PASSWORD`.
2. Установите:

   ```env
   APP_ADMIN_INITIALIZER_ENABLED=true
   APP_ADMIN_EMAIL=admin@example.com
   ```

3. Запустите backend и проверьте login.
4. Сразу установите initializer в `false`, очистите secret-файл и пересоздайте
   backend:

   ```bash
   docker compose up -d --force-recreate backend
   ```

Для аварийного восстановления используйте аналогичный одноразовый механизм
`APP_ADMIN_RECOVERY_ENABLED`, `APP_ADMIN_RECOVERY_EMAIL` и
`APP_ADMIN_RECOVERY_PASSWORD`. Recovery endpoint намеренно отсутствует.

### Backups и rollback

Автоматический `postgres-backup` создаёт compressed custom-format dump,
проверяет его через `pg_restore --list`, требует успешную
`flyway_schema_history`, создаёт SHA-256 checksum и удаляет архивы старше срока
retention. Restore повторно проверяет checksum и историю Flyway до запуска
backend.

Ручной backup:

```bash
docker compose run --rm --entrypoint /bin/sh postgres-backup \
  /scripts/backup.sh
```

Restore пересоздаёт базу и уничтожает её текущее содержимое:

```bash
docker compose stop backend
docker compose run --rm --entrypoint /bin/sh postgres-backup \
  /scripts/restore.sh /backups/users_db_YYYYMMDDTHHMMSSZ.dump
docker compose start backend
```

После restore backend обязан пройти Flyway validation и readiness. Полная
изолированная проверка того же сценария:

```bash
docker build -t personal-website-backup-restore:local springboot
BACKUP_RESTORE_BACKEND_IMAGE=personal-website-backup-restore:local \
  /bin/sh ops/postgres/verify-backup-restore.sh
```

Этот тест создаёт временные Docker network, volume и containers, восстанавливает
контрольную запись, повторно запускает backend и проверяет Flyway в логах. Те же
действия выполняет обязательный CI job `Database / Backup restore`.

Храните копии backup в зашифрованном off-site storage и регулярно проверяйте
restore на отдельной PostgreSQL. Полный порядок application rollback и
восстановления БД находится в
[docs/release-rollback.md](docs/release-rollback.md).

### Observability

Prometheus собирает backend-метрики и Blackbox probes. Grafana автоматически
получает Prometheus/Loki datasources и dashboard `Personal website overview`.
Alloy собирает JSON logs Docker-контейнеров и отправляет их в Loki.
Alertmanager отправляет firing и resolved events на URL из
`ALERTMANAGER_WEBHOOK_URL`.

Подробные alerts, запросы, проверки и incident procedures:
[docs/observability-runbook.md](docs/observability-runbook.md).

## Troubleshooting

### Backend не стартует: datasource properties are not set

Проверьте наличие `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
абсолютный `APP_SECRETS_DIRECTORY` и читаемый файл
`SPRING_DATASOURCE_PASSWORD`.

```bash
docker exec personal-website-postgres-dev \
  pg_isready -U postgres-user -d users_db
```

### Connection refused к PostgreSQL

- убедитесь, что dev-контейнер запущен;
- проверьте host-порт через `docker ps`;
- при `5433:5432` измените JDBC URL на `localhost:5433`;
- внутри Compose используйте host `postgres`, а не `localhost`.

### Flyway checksum mismatch или validation failed

Не изменяйте применённый SQL-файл и не удаляйте строки из
`flyway_schema_history`. Верните файл к исходному содержимому и создайте новую
миграцию. Для диагностики:

```bash
docker compose logs backend
docker compose exec postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "select installed_rank, version, description, success from flyway_schema_history order by installed_rank;"'
```

### Admin login не сохраняет сессию локально

Проверьте, что не активен `prod`, а локальная конфигурация содержит:

```env
APP_SESSION_COOKIE_SECURE=false
APP_SECURITY_REQUIRE_HTTPS=false
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

Предпочитайте стандартный Vite proxy и `/api`. При прямом cross-origin API URL
origin должен точно присутствовать в CORS, а запросы должны передавать cookie.

### Backend падает после первого bootstrap

После создания администратора задайте
`APP_ADMIN_INITIALIZER_ENABLED=false`, очистите `APP_ADMIN_PASSWORD` и
перезапустите backend. Повторный bootstrap блокируется намеренно.

### Public SSR получает ECONNREFUSED или 5xx

Для локального запуска используйте:

```env
PUBLIC_BACKEND_INTERNAL_URL=http://localhost:8080/api
PUBLIC_SITE_ORIGIN=http://localhost:5173
```

В Compose backend URL должен быть `http://backend:8080/api`. Убедитесь, что
backend readiness имеет статус `UP`.

### Frontend не видит изменённые `VITE_*`

Эти значения встраиваются во время build. Остановите dev server или пересоберите
production image:

```bash
npm run build
docker compose build frontend-public frontend-admin
docker compose up -d frontend-public frontend-admin
```

### Swagger UI или `/v3/api-docs` возвращает 404

Для прямого локального запуска проверьте:

```env
SPRINGDOC_API_DOCS_ENABLED=true
SPRINGDOC_SWAGGER_UI_ENABLED=true
```

В production эти endpoints по умолчанию выключены, а Caddy/Nginx намеренно не
маршрутизируют их из интернета. Подробности находятся в
[docs/api.md](docs/api.md).

### Testcontainers-тест пропущен

Класс PostgreSQL-тестов использует `disabledWithoutDocker=true`. Запустите Docker
и повторите:

```bash
cd springboot
./mvnw -Dtest=PostgreSqlMigrationIntegrationTests test
```

В CI дополнительно проверяется, что все три PostgreSQL-теста действительно
выполнились без skip.

### `docker compose config` сообщает о required variable или missing secret

Сравните `.env` с `.env.example`, проверьте абсолютный
`APP_SECRETS_DIRECTORY`, имена всех шести файлов и права доступа. Не помещайте
пароли непосредственно в `.env`.

### Caddy не получает TLS-сертификат

Проверьте A/AAAA records, доступность TCP `80/443` и UDP `443`, корректность
`PUBLIC_DOMAIN`, `ADMIN_DOMAIN`, `ACME_EMAIL` и отсутствие другого процесса на
портах. Диагностика:

```bash
docker compose logs edge-proxy
```

### Сервис в Compose имеет статус unhealthy

```bash
docker compose ps
docker compose logs --tail 200 <service>
docker inspect <container> --format '{{json .State.Health}}'
```

Для backend сначала проверьте PostgreSQL и Flyway; для обоих frontend —
`/healthz` и backend readiness; для Prometheus — корректность probe URL.

### Порт уже занят

Локально чаще всего конфликтуют `5432`, `5173`, `5174`, `8080` и `3000`.
Остановите конфликтующий процесс или измените соответствующий host/runtime port
и связанные URL. Production observability ports можно изменить через
`GRAFANA_PORT`, `PROMETHEUS_PORT` и `ALERTMANAGER_PORT`.
