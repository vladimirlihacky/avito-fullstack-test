# AI Assistants Catalog — Fullstack

## О проекте

Репозиторий содержит backend-сервис для каталога AI-ассистентов (Go + PostgreSQL + JWT + мокируемый LLM) и frontend SPA на React.

## Что работает

- REST API по спецификации `api.yml`
- JWT-авторизация с тестовым `/dummyLogin`
- Роли `admin` и `user`
- Категории ассистентов
- CRUD ассистентов (создание, редактирование, получение, список)
- Запуск ассистента и сохранение истории `runs`
- Frontend SPA: `/login`, `/assistants`, `/assistants/:id`, `/runs/my`, админ-страницы
- Mock LLM provider с детерминированным ответом
- Авто-применение миграций при старте через Docker Compose
- Тесты: unit + backend E2E

## Требования

- Docker
- Docker Compose
- Go 1.26+
- PostgreSQL (используется в контейнере)

## Запуск

### 1. Копируйте `.env.example` в `.env`

```bash
cp .env.example .env
```

### 2. Проверьте значение порта

Backend слушает порт `8080` внутри контейнера.
В `.env.example` указано:

```env
BACKEND_PORT=8000
```

Для корректной работы убедитесь, что переменная установлена так:

```env
BACKEND_PORT=8080
```

Если используется Docker Compose без `.env`, порт по умолчанию будет `8080`.

### 3. Запуск сервиса

```bash
docker compose up --build
```

После запуска backend доступен по адресу:

```text
http://localhost:8080
```

Frontend доступен по адресу:
```text
http://localhost:3000
```

### 4. Проверка healthcheck

```bash
curl http://localhost:8080/_info
```

Ожидаемый ответ: `200 OK`

## Структура базы данных

Миграции находятся в `backend/migrations`.

Схема включает:

- `users` — пользователи (admin/user)
- `categories` — категории ассистентов
- `assistants` — ассистенты каталога
- `runs` — история запусков ассистентов

Индексы:

- `idx_assistants_category_id`
- `idx_assistants_is_active`
- `idx_assistants_search`
- `idx_runs_user_id_created_at`
- `idx_runs_assistant_id`
- `idx_runs_status`

## Dummy login и тестовые пользователи

Для тестирования используется `/dummyLogin`.
Токены выдаются для фиксированных UUID:

- admin: `00000000-0000-0000-0000-000000000001`
- user: `00000000-0000-0000-0000-000000000002`

Пример запроса:

```bash
curl -X POST http://localhost:8080/dummyLogin \
  -H 'Content-Type: application/json' \
  -d '{"role":"admin"}'
```

Ответ содержит JWT и данные пользователя.

## API

### Public
- `GET /_info` — healthcheck
- `POST /dummyLogin` — получить тестовый JWT

### Protected (Bearer JWT)
- `GET /categories`
- `POST /categories` — admin
- `GET /assistants`
- `POST /assistants` — admin
- `GET /assistants/{assistantId}`
- `PUT /assistants/{assistantId}` — admin
- `POST /assistants/{assistantId}/run`
- `GET /runs/my`
- `GET /admin/runs` — admin

### Пример использования

Получение списка ассистентов:

```bash
curl "http://localhost:8080/assistants?page=1&pageSize=10&q=повар&categoryId=<uuid>" \
  -H "Authorization: Bearer <token>"
```

Запуск ассистента:

```bash
curl -X POST http://localhost:8080/assistants/<assistantId>/run \
  -H "Authorization: Bearer <token>" \
  -H 'Content-Type: application/json' \
  -d '{"userPrompt":"курица, рис, томаты"}'
```

## Mock LLM-провайдер

Реализация находится в `backend/internal/llm/mock/provider.go`.

Контракт provider:

```go
type LLMRequest struct {
    Model        string
    SystemPrompt string
    UserPrompt   string
}
```

Mock отвечает детерминированно по шаблону:

```text
[mock] model=<model> | <userPrompt>
```

Backend формирует запрос к LLM из следующих данных:

- `assistant.Model`
- `assistant.SystemPrompt`
- `userPrompt` из тела запроса

### Пример итогового запроса в LLM

```json
{
  "model": "mock-smart",
  "systemPrompt": "Составь подробный рецепт по ингредиентам.",
  "userPrompt": "курица, рис, томаты"
}
```

## Поведение запуска ассистента

При создании запуска backend выполняет:

1. Проверяет существование ассистента
2. Проверяет, что ассистент активен
3. Сохраняет запуск в БД со статусом `pending`
4. Вызывает LLM provider с `systemPrompt`
5. Если провайдер вернул ответ — переводит запуск в `success`
6. Если произошла ошибка или таймаут — переводит запуск в `failed`

Все запуски сохраняются независимо от результата.

## Тесты

### Запуск unit-тестов

```bash
cd backend
go test ./internal/...
```

### Запуск E2E-тестов

```bash
cd backend
go test ./tests/e2e/...
```

### Тесты через Docker Compose

```bash
docker compose -f docker-compose.test.yml up --build --remove-orphans
```

## Ограничения и текущий статус

- `docker-compose.yml` запускает backend, postgres и frontend.
- Дополнительная регистрация по email/password есть в коде, но основной flow сейчас основан на `/dummyLogin`.

## Полезные файлы

- `backend/cmd/backend/main.go` — входная точка сервиса
- `backend/internal/handler` — HTTP-обработчики
- `backend/internal/service` — бизнес-логика
- `backend/internal/repo/postgres` — доступ к базе
- `backend/internal/llm/mock` — mock LLM provider
- `backend/migrations` — SQL-миграции
