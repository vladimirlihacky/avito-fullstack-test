# AI Assistants Catalog

Fullstack-приложение для каталога AI-ассистентов. Backend на Go, frontend SPA на React.

## Стек

**Backend:** Go · PostgreSQL · JWT · chi router  
**Frontend:** BunJS · React 19 · TypeScript · TanStack Router · TanStack Query · Tailwind CSS · shadcn/ui  
**Инфраструктура:** Docker Compose · nginx · GitHub Actions

Bun использовал только для более быстрого билда и тестов, при желании проект легко полностью переносится на NodeJS

## Быстрый старт

```bash
cp .env.example .env
docker compose up --build
```

| Сервис   | Адрес                   |
|----------|-------------------------|
| Frontend | http://localhost:3000   |
| Backend  | http://localhost:8080   |

Healthcheck:

```bash
curl http://localhost:8080/_info
```

## Переменные окружения

Все переменные описаны в `.env.example`. Значимые:

| Переменная          | По умолчанию | Описание                        |
|---------------------|--------------|---------------------------------|
| `BACKEND_PORT`      | `8080`       | Порт backend внутри контейнера  |
| `CLIENT_PORT`       | `3000`       | Внешний порт frontend           |
| `DATABASE_PORT`     | `5432`       | Внешний порт PostgreSQL         |
| `JWT_SECRET`        | `secret`     | Секрет для подписи JWT          |
| `POSTGRES_USER`     | `postgres`   |                                 |
| `POSTGRES_PASSWORD` | `password`   |                                 |
| `POSTGRES_DB`       | `postgres`   |                                 |

## Авторизация

Используется `/dummyLogin` — выдаёт JWT для фиксированных тестовых пользователей:

```bash
# Получить токен администратора
curl -X POST http://localhost:8080/dummyLogin \
  -H 'Content-Type: application/json' \
  -d '{"role":"admin"}'

# Получить токен пользователя
curl -X POST http://localhost:8080/dummyLogin \
  -H 'Content-Type: application/json' \
  -d '{"role":"user"}'
```

Тестовые UUID: admin — `00000000-0000-0000-0000-000000000001`, user — `00000000-0000-0000-0000-000000000002`.

## API

### Публичные

| Метод | Путь          | Описание        |
|-------|---------------|-----------------|
| GET   | `/_info`      | Healthcheck     |
| POST  | `/dummyLogin` | Получить JWT    |
| POST  | `/login`      | Логин           |
| POST  | `/register`   | Регистрация     |

### Защищённые (Bearer JWT)

| Метод | Путь                            | Роль    | Описание                      |
|-------|---------------------------------|---------|-------------------------------|
| GET   | `/categories`                   | any     | Список категорий              |
| POST  | `/categories`                   | admin   | Создать категорию             |
| GET   | `/assistants`                   | any     | Список ассистентов            |
| POST  | `/assistants`                   | admin   | Создать ассистента            |
| GET   | `/assistants/:id`               | any     | Карточка ассистента           |
| PUT   | `/assistants/:id`               | admin   | Обновить ассистента           |
| POST  | `/assistants/:id/run`           | any     | Запустить ассистента          |
| GET   | `/runs/my`                      | any     | Мои запуски                   |
| GET   | `/admin/runs`                   | admin   | Все запуски                   |

Параметры фильтрации `GET /assistants`: `page`, `pageSize`, `q` (полнотекстовый поиск), `categoryId`, `includeInactive` (только admin).

## Архитектурные решения

### Backend

Трёхслойная архитектура: `handler → service → repository`. Интерфейсы объявляются на стороне потребителя — сервисы не зависят от конкретных реализаций репозиториев и LLM-провайдера, что упрощает тестирование через моки.

Доменные ошибки (`ErrNotFound`, `ErrAssistantInactive`, `ErrLLMProvider` и др.) объявлены в `domain/errors.go` и проверяются через `errors.Is` на уровне хендлеров — HTTP-статусы выставляются там, а не в бизнес-логике.

Системный промпт скрывается от роли `user` на уровне хендлера. Флаг `includeInactive` для не-admin принудительно сбрасывается там же.

Полнотекстовый поиск по ассистентам реализован через `websearch_to_tsquery('russian', ...)` с GIN-индексом. История запусков индексирована по `(user_id, created_at DESC)`.

### Frontend

Чистый CSR SPA: TanStack Router (file-based routing, типобезопасные параметры) + TanStack Query (серверный стейт, кэширование, инвалидация). Глобальный стейт (токен, роль) — в `sessionStorage`

API-слой разделён на три уровня: `fetcher` (HTTP + обработка ошибок) → `client` (доменные функции) → `hooks` (интеграция с React Query). Компоненты зависят только от хуков.

QueryKeys организованы иерархически — инвалидация `assistants.all()` автоматически сбрасывает списки и детали.

Запросы к backend проксируются через nginx (`/api/` → `http://backend:8080/`), поэтому в коде используется относительный базовый путь `/api` без хардкода хоста.

### LLM Provider

Интерфейс провайдера объявлен в домене:

```go
type LLMProvider interface {
    Complete(ctx context.Context, req LLMRequest) (LLMResponse, error)
}
```

Текущая реализация — `mock`, отвечает детерминированно:

```
[mock] model=<model> | <userPrompt>
```

Для подключения OpenAI-совместимого провайдера достаточно реализовать интерфейс и переключить переменную `LLM_PROVIDER=openai` в окружении. Таймаут LLM-вызова — 30 секунд (задаётся через `context.WithTimeout` в `RunService`).

## Поведение запуска ассистента

1. Проверяется существование и активность ассистента
2. Запуск сохраняется в БД со статусом `pending`
3. Вызывается LLM provider с `model`, `systemPrompt`, `userPrompt`
4. При успехе — статус `success`, результат сохраняется
5. При ошибке или таймауте — статус `failed`, сообщение об ошибке сохраняется

Все запуски сохраняются независимо от результата.

## Тесты

```bash
# Unit-тесты backend
cd backend && go test ./internal/... -v

# E2E-тесты backend (требуют запущенный PostgreSQL)
cd backend && go test ./tests/e2e/... -v -timeout 120s

# Тесты backend через Docker Compose (изолированная БД)
docker compose -f docker-compose.test.yml up --build --remove-orphans

# Тесты frontend
cd client && bun test
```

E2E-тест воспроизводит полный сценарий: создание ассистента администратором → запуск пользователем → проверка истории.

## CI

GitHub Actions запускает при каждом пуше и PR в `main`:

- **test-backend** — unit + E2E тесты с реальным PostgreSQL
- **lint-backend** — golangci-lint
- **test-frontend** — vitest + tsc --noEmit
- **lint-frontend** — eslint + prettier
- **build** — `docker compose up --build`, healthcheck `/_info` и фронтенда
