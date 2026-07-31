# Инструкция отката релиза

## Общие правила

- Каждый релиз использует неизменяемый `RELEASE_VERSION`. Один тег должен
  обозначать согласованный набор backend, public frontend, admin frontend и
  edge proxy.
- Не удаляйте образы предыдущего стабильного релиза до окончания периода
  наблюдения.
- Flyway-миграции являются forward-only. Не редактируйте применённые миграции и
  не используйте `flyway clean` в production.
- Сначала выполняйте откат приложения. Восстановление базы требуется только при
  несовместимой миграции и приводит к потере данных, записанных после backup.
- Не удаляйте `postgres_data`, `caddy_data` или каталоги внешних секретов во
  время отката.

## Что сохранить перед релизом

1. Запишите текущий стабильный `RELEASE_VERSION` и Git commit.
2. Сохраните копию непубличных deployment-настроек без значений секретов.
3. Создайте и проверьте backup:

   ```bash
   docker compose run --rm --entrypoint /bin/sh postgres-backup \
     /scripts/backup.sh
   ```

4. Убедитесь, что для `.dump` существует корректный `.sha256`, а
   `pg_restore --list` завершается успешно.
5. Проверьте, что предыдущие release-образы доступны:

   ```bash
   export PREVIOUS_RELEASE=2026.07.27-1
   docker image inspect "personal-website-backend:${PREVIOUS_RELEASE}"
   docker image inspect "personal-website-frontend-public:${PREVIOUS_RELEASE}"
   docker image inspect "personal-website-frontend-admin:${PREVIOUS_RELEASE}"
   docker image inspect "personal-website-edge-proxy:${PREVIOUS_RELEASE}"
   ```

## Откат только приложения

Этот вариант не изменяет PostgreSQL и должен использоваться первым.

1. Укажите предыдущий стабильный тег в `.env`:

   ```env
   RELEASE_VERSION=2026.07.27-1
   ```

2. Не запускайте сборку. Пересоздайте только application-контейнеры из готовых
   образов:

   ```bash
   docker compose up -d --no-build --force-recreate \
     backend frontend-public frontend-admin edge-proxy
   ```

3. Проверьте состояние:

   ```bash
   docker compose ps
   curl --fail "https://${PUBLIC_DOMAIN}/api/health"
   curl --fail "https://${PUBLIC_DOMAIN}/"
   curl --fail "https://${ADMIN_DOMAIN}/login"
   ```

4. Проверьте вход администратора, публичные страницы, отправку контактной формы
   и логи:

   ```bash
   docker compose logs --since 10m backend edge-proxy
   ```

## Откат с восстановлением PostgreSQL

Используйте этот сценарий только если предыдущая версия приложения
несовместима с уже применённой схемой. Получите явное подтверждение допустимой
потери данных после выбранного backup.

1. Остановите трафик и backend, но оставьте PostgreSQL запущенным:

   ```bash
   docker compose stop edge-proxy frontend-public frontend-admin backend
   ```

2. Создайте дополнительный backup текущего аварийного состояния и сохраните его
   отдельно.
3. Восстановите проверенный pre-release backup:

   ```bash
   docker compose run --rm --entrypoint /bin/sh postgres-backup \
     /scripts/restore.sh /backups/users_db_YYYYMMDDTHHMMSSZ.dump
   ```

4. Установите предыдущий `RELEASE_VERSION` в `.env` и поднимите приложение без
   сборки:

   ```bash
   docker compose up -d --no-build \
     backend frontend-public frontend-admin edge-proxy
   ```

5. Повторите health checks и функциональную проверку из сценария отката
   приложения. Убедитесь, что backend стал ready, а в логах есть успешная Flyway
   validation с ожидаемым количеством миграций:

   ```bash
   docker compose logs --since 10m backend | grep 'Successfully validated'
   curl --fail "https://${PUBLIC_DOMAIN}/api/health"
   ```

## После отката

- Зафиксируйте причину, время, выбранный release и backup.
- Не перезаписывайте неудачный тег новым образом.
- Подготовьте исправление как новый release, прогоните CI и выполните обычный
  forward deployment.
