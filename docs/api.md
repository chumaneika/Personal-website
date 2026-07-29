# API Personal Website

## OpenAPI и Swagger UI

При локальном запуске backend публикует:

| Ресурс          | URL                                      |
| --------------- | ---------------------------------------- |
| Swagger UI      | <http://localhost:8080/swagger-ui.html>  |
| OpenAPI JSON    | <http://localhost:8080/v3/api-docs>      |
| OpenAPI YAML    | <http://localhost:8080/v3/api-docs.yaml> |
| Health endpoint | <http://localhost:8080/api/health>       |

Спецификация генерируется Springdoc из Spring MVC mappings, DTO, validation
constraints и OpenAPI-аннотаций. В неё входят только маршруты `/api/**`;
Actuator, `robots.txt` и `sitemap.xml` намеренно исключены.

В production profile и Docker Compose OpenAPI и Swagger UI выключены по
умолчанию:

```env
SPRINGDOC_API_DOCS_ENABLED=false
SPRINGDOC_SWAGGER_UI_ENABLED=false
```

Их можно временно включить для диагностики внутри доверенной сети. Текущая
конфигурация Caddy/Nginx не публикует `/v3/api-docs` и `/swagger-ui` наружу,
даже если backend endpoints включены. Не открывайте Swagger UI в интернет без
отдельного access control.

## Общие соглашения

- Base URL локально: `http://localhost:8080`.
- API prefix первой major-версии: `/api`.
- Формат request/response body: `application/json`, кроме ответов `204`.
- ID ресурсов — положительный `int64`.
- Даты без времени — ISO `YYYY-MM-DD`.
- Timestamps — ISO-8601 UTC, например `2026-07-29T12:34:56Z`.
- Slug содержит буквы, цифры и одиночные дефисы.
- Каждый ответ содержит `X-Request-ID`; корректный входной `X-Request-ID`
  возвращается обратно, иначе backend генерирует UUID.
- Пустые списки возвращаются как `[]`, а не `null`.

Enum-значения:

```text
PublicationStatus: DRAFT | PUBLISHED | ARCHIVED
SkillLevel: BASIC | INTERMEDIATE | ADVANCED
ContactMessageStatus: NEW | READ | ARCHIVED
UserRole: ADMIN
```

## Публичные endpoints

Публичные операции не требуют сессии или CSRF.

| Метод  | Путь                    | Успех     | Назначение                                                             |
| ------ | ----------------------- | --------- | ---------------------------------------------------------------------- |
| `GET`  | `/api/health`           | `200`     | Состояние API, имя приложения и timestamp                              |
| `GET`  | `/api/home`             | `200`     | Агрегированные данные главной страницы                                 |
| `GET`  | `/api/profile`          | `200`     | Опубликованный профиль; `404`, если профиль не создан                  |
| `GET`  | `/api/projects`         | `200`     | Краткие данные опубликованных проектов                                 |
| `GET`  | `/api/projects/{slug}`  | `200`     | Полные данные опубликованного проекта; иначе `404`                     |
| `GET`  | `/api/articles`         | `200`     | Краткие данные опубликованных статей                                   |
| `GET`  | `/api/articles/{slug}`  | `200`     | Полные данные опубликованной статьи; иначе `404`                       |
| `GET`  | `/api/skills`           | `200`     | Видимые навыки; optional query `categoryId`                            |
| `GET`  | `/api/skill-categories` | `200`     | Все категории навыков                                                  |
| `POST` | `/api/contact-messages` | `201/202` | Отправить контактную форму; CSRF намеренно отключён для этого маршрута |

### Контактная форма

Request:

```json
{
  "senderName": "Ada Lovelace",
  "senderEmail": "ada@example.com",
  "message": "Хочу обсудить проект.",
  "website": ""
}
```

Ограничения:

- `senderName`: обязательно, максимум 120 символов;
- `senderEmail`: обязательно, валидный email, максимум 254 символа;
- `message`: обязательно, максимум 5000 символов;
- `website`: honeypot, обычный клиент оставляет пустым;
- весь request ограничен `APP_CONTACT_MAX_REQUEST_BYTES`.

Ответы:

- `201 Created` и сохранённое сообщение — обычный запрос;
- `202 Accepted` без body — заполнен honeypot, сообщение не сохранено;
- `400 Bad Request` — validation или malformed JSON;
- `413 Payload Too Large` — превышен лимит request body;
- `429 Too Many Requests` — превышен rate limit, присутствует `Retry-After`.

## Авторизация

Admin API использует server-side HTTP session, а не JWT или Bearer token.

### Последовательность входа

1. Вызвать `GET /api/auth/csrf`.
2. Сохранить cookie `JSESSIONID`.
3. Взять `token` и `headerName` из ответа.
4. Вызвать `POST /api/auth/login` с той же cookie и header
   `X-CSRF-TOKEN: <token>`.
5. Для каждого `POST`, `PUT`, `PATCH` и `DELETE` в admin API передавать
   `JSESSIONID` и CSRF header.
6. Завершить сессию через `POST /api/auth/logout` с CSRF header.

CSRF response:

```json
{
  "token": "csrf-token-value",
  "headerName": "X-CSRF-TOKEN"
}
```

Login request:

```json
{
  "email": "admin@example.com",
  "password": "administrator-password"
}
```

Login response:

```json
{
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

Пример с curl:

```bash
curl --cookie-jar cookies.txt \
  http://localhost:8080/api/auth/csrf
```

Скопируйте `token` из ответа:

```bash
curl --cookie cookies.txt \
  --cookie-jar cookies.txt \
  --header 'Content-Type: application/json' \
  --header 'X-CSRF-TOKEN: <token>' \
  --data '{"email":"admin@example.com","password":"administrator-password"}' \
  http://localhost:8080/api/auth/login
```

Swagger UI выполняет запросы с того же origin, поэтому browser отправляет
session cookie автоматически. CSRF-токен нужно получить через соответствующую
операцию и вручную вставить в поле `X-CSRF-TOKEN` изменяющего запроса.

### Authentication endpoints

| Метод  | Путь               | Успех | Назначение                                                             |
| ------ | ------------------ | ----- | ---------------------------------------------------------------------- |
| `GET`  | `/api/auth/csrf`   | `200` | Получить или создать session CSRF token                                |
| `POST` | `/api/auth/login`  | `200` | Проверить credentials, сменить session ID и сохранить security context |
| `POST` | `/api/auth/logout` | `204` | Инвалидировать session, очистить authentication и удалить cookie       |

Ошибки login:

- `400` — невалидный request;
- `401` — неверный email или пароль;
- `403` — отсутствует или не совпадает CSRF token;
- `429` — превышен лимит попыток, присутствует `Retry-After`.

Logout реализован Spring Security filter и добавляется в OpenAPI отдельным
customizer, потому что у него нет MVC controller method.

## Административные endpoints

Все `/api/admin/**` требуют пользователя с ролью `ADMIN` и session cookie.
Изменяющие операции дополнительно требуют `X-CSRF-TOKEN`.

Общие ошибки:

- `401 Unauthorized` — сессия отсутствует или истекла;
- `403 Forbidden` — недостаточная роль или недействительный CSRF token;
- `400 Bad Request` — validation, malformed JSON или неверный enum/query;
- `404 Not Found` — ресурс не существует;
- `409 Conflict` — нарушено ограничение уникальности или связности.

### Account и dashboard

| Метод  | Путь                          | Успех | Назначение                                         |
| ------ | ----------------------------- | ----- | -------------------------------------------------- |
| `GET`  | `/api/admin/me`               | `200` | Email и роль текущего администратора               |
| `POST` | `/api/admin/account/password` | `204` | Сменить пароль и инвалидировать текущую сессию     |
| `GET`  | `/api/admin/dashboard`        | `200` | Сводные количества контента и контактных сообщений |
| `GET`  | `/api/admin/meta/enums`       | `200` | Enum-значения и категории для admin-форм           |

Password request:

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-secure-password-123"
}
```

Новый пароль: 12–128 символов, минимум одна буква и одна цифра; он должен
отличаться от текущего.

### Profile

| Метод | Путь                 | Успех | Назначение                             |
| ----- | -------------------- | ----- | -------------------------------------- |
| `GET` | `/api/admin/profile` | `200` | Получить профиль; `404`, если его нет  |
| `PUT` | `/api/admin/profile` | `200` | Создать или полностью обновить профиль |

Обязательные поля profile request: `firstName`, `lastName`, `headline`.
Ограничения остальных полей и полный schema доступны в OpenAPI.

### Projects

| Метод    | Путь                              | Успех | Назначение                     |
| -------- | --------------------------------- | ----- | ------------------------------ |
| `GET`    | `/api/admin/projects`             | `200` | Все проекты; optional `status` |
| `GET`    | `/api/admin/projects/{id}`        | `200` | Проект по ID                   |
| `POST`   | `/api/admin/projects`             | `201` | Создать проект                 |
| `PUT`    | `/api/admin/projects/{id}`        | `200` | Полностью обновить проект      |
| `PATCH`  | `/api/admin/projects/{id}/status` | `200` | Изменить `PublicationStatus`   |
| `DELETE` | `/api/admin/projects/{id}`        | `204` | Удалить проект                 |

Project request содержит title, slug, описания, technology stack, URL, status
и даты. `completedAt` не может быть раньше `startedAt`; slug уникален без учёта
регистра после нормализации.

Status request:

```json
{
  "status": "PUBLISHED"
}
```

### Articles

| Метод    | Путь                              | Успех | Назначение                    |
| -------- | --------------------------------- | ----- | ----------------------------- |
| `GET`    | `/api/admin/articles`             | `200` | Все статьи; optional `status` |
| `GET`    | `/api/admin/articles/{id}`        | `200` | Статья по ID                  |
| `POST`   | `/api/admin/articles`             | `201` | Создать статью                |
| `PUT`    | `/api/admin/articles/{id}`        | `200` | Полностью обновить статью     |
| `PATCH`  | `/api/admin/articles/{id}/status` | `200` | Изменить `PublicationStatus`  |
| `DELETE` | `/api/admin/articles/{id}`        | `204` | Удалить статью                |

Обязательные поля article request: `title`, `slug`, `content`. Slug уникален.
`summary` ограничен 1000 символами, `content` — 100000 символами.

### Skill categories

| Метод    | Путь                               | Успех | Назначение                       |
| -------- | ---------------------------------- | ----- | -------------------------------- |
| `GET`    | `/api/admin/skill-categories`      | `200` | Все категории                    |
| `GET`    | `/api/admin/skill-categories/{id}` | `200` | Категория по ID                  |
| `POST`   | `/api/admin/skill-categories`      | `201` | Создать уникальную категорию     |
| `PUT`    | `/api/admin/skill-categories/{id}` | `200` | Полностью обновить категорию     |
| `DELETE` | `/api/admin/skill-categories/{id}` | `204` | Удалить неиспользуемую категорию |

Category request:

```json
{
  "name": "Backend"
}
```

Удаление используемой категории возвращает `409 Conflict`.

### Skills

| Метод    | Путь                                | Успех | Назначение                   |
| -------- | ----------------------------------- | ----- | ---------------------------- |
| `GET`    | `/api/admin/skills`                 | `200` | Все навыки, включая скрытые  |
| `GET`    | `/api/admin/skills/{id}`            | `200` | Навык по ID                  |
| `POST`   | `/api/admin/skills`                 | `201` | Создать навык                |
| `PUT`    | `/api/admin/skills/{id}`            | `200` | Полностью обновить навык     |
| `PATCH`  | `/api/admin/skills/{id}/visibility` | `200` | Изменить публичную видимость |
| `DELETE` | `/api/admin/skills/{id}`            | `204` | Удалить навык                |

Skill request:

```json
{
  "name": "Spring Boot",
  "categoryId": 10,
  "level": "ADVANCED",
  "sortOrder": 0,
  "visible": true
}
```

Visibility request:

```json
{
  "visible": false
}
```

### Contact messages

| Метод    | Путь                                      | Успех | Назначение         |
| -------- | ----------------------------------------- | ----- | ------------------ |
| `GET`    | `/api/admin/contact-messages`             | `200` | Страница сообщений |
| `GET`    | `/api/admin/contact-messages/{id}`        | `200` | Сообщение по ID    |
| `PATCH`  | `/api/admin/contact-messages/{id}/status` | `200` | Изменить status    |
| `DELETE` | `/api/admin/contact-messages/{id}`        | `204` | Удалить сообщение  |

Query parameters списка:

- `status` — optional `ContactMessageStatus`;
- `page` — от `0`, по умолчанию `0`;
- `size` — от `1` до `100`, по умолчанию `20`.

Page response:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0,
  "first": true,
  "last": true
}
```

Status request:

```json
{
  "status": "READ"
}
```

## Формат ошибок

Ожидаемые validation, domain, security, rate-limit и request-size ошибки
возвращаются в едином формате:

```json
{
  "timestamp": "2026-07-29T12:34:56Z",
  "status": 400,
  "error": "Bad Request",
  "message": "title: must not be blank",
  "path": "/api/admin/projects"
}
```

Поля:

| Поле        | Тип         | Описание                    |
| ----------- | ----------- | --------------------------- |
| `timestamp` | ISO instant | Время формирования ответа   |
| `status`    | integer     | HTTP status code            |
| `error`     | string      | Стандартное имя HTTP status |
| `message`   | string      | Безопасная причина ошибки   |
| `path`      | string      | Путь запроса                |

Типовые status codes:

| Status | Когда используется                                                |
| ------ | ----------------------------------------------------------------- |
| `400`  | Validation, malformed JSON, неверный enum/query или business rule |
| `401`  | Неверные credentials или отсутствующая admin session              |
| `403`  | Недостаточная роль, missing/invalid CSRF token                    |
| `404`  | Ресурс не найден                                                  |
| `409`  | Unique/data conflict                                              |
| `413`  | Слишком большой contact request                                   |
| `429`  | Login/contact rate limit; присутствует `Retry-After`              |
| `500`  | Неожиданная серверная ошибка                                      |

В production детали неожиданных `5xx` скрыты. Клиент не должен анализировать
текст `message` как стабильный machine-readable error code. Для корреляции с
логами используйте response header `X-Request-ID`.

## Правила версионирования API

OpenAPI `info.version` следует Semantic Versioning. Текущая версия контракта —
`1.0.0`.

### Маршруты major-версий

- Текущий prefix `/api` навсегда обозначает контракт v1.
- `/api` не будет незаметно перенаправлен на будущую major-версию.
- Первая несовместимая версия получит отдельный prefix `/api/v2`.
- Во время миграции v1 и v2 работают параллельно.

### Что меняет номер версии

- `PATCH`: исправления без изменения документированного HTTP-контракта.
- `MINOR`: обратно совместимые новые endpoints или optional response/request
  fields.
- `MAJOR`: удаление/переименование endpoint или поля, изменение типа или
  семантики, новый required field, изменение auth/CSRF flow, status code или
  pagination contract.
- Добавление enum-значения считается потенциально несовместимым и требует
  major-версии, если поле заранее не объявлено расширяемым.

### Deprecation

1. Deprecated operation или schema field помечается `deprecated: true` в
   OpenAPI и описывается в release notes.
2. Ответ старого endpoint получает `Deprecation: true` и `Sunset` с датой
   прекращения поддержки.
3. Период миграции по умолчанию — не менее 90 дней и минимум один стабильный
   production release новой major-версии.
4. После Sunset старый endpoint удаляется только в новой major-версии; v1
   contract внутри `/api` не меняется молча.

Любое изменение API должно сопровождаться обновлением:

- OpenAPI-аннотаций и DTO;
- этого документа;
- integration tests;
- `info.version`, если изменился публичный контракт.
