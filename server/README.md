# GogoMarket API (NestJS)

Бэкенд маркетплейса: **TypeORM + PostgreSQL**, **JWT-авторизация**, роли (Buyer, Seller, Courier, Admin) через Guards. Медиа (S3 или локальный `uploads/`), WebSocket (чат + трекинг курьера), история треков с лимитом и автоочисткой.

## Требования

- **Node.js** 18+
- **PostgreSQL** (локально или `docker compose up -d` в папке server)

## Переменные окружения

Скопируйте `.env.example` в `.env` и задайте:

- `DATABASE_URL` — строка подключения к PostgreSQL (обязательно)
- `JWT_SECRET` — секрет для подписи JWT (минимум 32 символа)
- `PORT` — порт API (по умолчанию 3001)
- `APP_PUBLIC_URL` — публичный URL API (для ссылок на загруженные файлы при локальном хранении), например `http://localhost:3001`
- **S3 (опционально):** `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL` — при заданных загрузки идут в S3 (DO Spaces), иначе в папку `uploads/`

**Rate limiting:** глобально 120 запросов в минуту на IP (Throttler). Эндпоинт `/health` не ограничивается.

## Запуск

```bash
cd server
npm install
cp .env.example .env   # отредактировать DATABASE_URL и JWT_SECRET
npm run start:dev
```

API: **http://localhost:3001**

## Эндпоинты

**Публичные (без токена):**

- `GET /health` — проверка работы (ok, service, version, ts)
- `GET /metrics` — метрики в формате Prometheus: gogomarket_info, gogomarket_uptime_seconds, gogomarket_http_requests_total, gogomarket_http_requests_by_route{method,path} (path нормализован: UUID и числа → :id). Примеры скрапа, алертов и дашборда Grafana — в папке `deploy/`.
- `GET /products` — каталог товаров
- `GET /orders` — все заказы
- `GET /orders/disputes` — заказы с открытым спором

**Авторизация:**

- `POST /auth/register` — регистрация: `{ email, password, role }` (role: BUYER | SELLER_FULL | SELLER_SIMPLE | COURIER | ADMIN)
- `POST /auth/login` — вход: `{ email, password }` → в ответе `access_token` и `user`

При первом запуске (если в БД нет пользователей) создаётся тестовый: **admin@gogomarket.local** / **GogoAdmin123** (роль ADMIN). Смени пароль после входа или зарегистрируй своих пользователей.

**С JWT (заголовок `Authorization: Bearer <token>`):**

- `POST /orders` — создать заказ (роль **BUYER**): `{ total, status?, items }`
- `PATCH /orders/:id/dispute` — открыть спор (роль **BUYER**): `{ reason, comment? }`
- `PATCH /orders/:id/dispute/resolve` — решить спор (роль **ADMIN**): `{ resolution, resolvedBy }`
- `GET /orders/new-for-seller` — новые заказы (роль **SELLER_FULL** / **SELLER_SIMPLE**)
- `PATCH /orders/:id/confirm` — подтвердить заказ (продавец)
- `GET /users/couriers` — список курьеров (роль **ADMIN**)
- `PATCH /orders/:id/assign` — назначить курьера (роль **ADMIN**): `{ courierId }`
- `GET /orders/my-deliveries` — мои доставки (роль **COURIER**)
- `PATCH /orders/:id/status` — обновить статус (роль **COURIER**): `{ status }`
- `GET /orders/:id/tracks` — история треков заказа (покупатель заказа / курьер заказа / **ADMIN**)
- `POST /products` — создать товар (роль **SELLER_FULL** / **SELLER_SIMPLE** / **ADMIN**): `{ name, price, description?, sellerType, imageUrl?, videoUrl? }`
- `PATCH /products/:id` — обновить товар (продавец / **ADMIN**)
- `POST /media/upload` — загрузка файла (multipart, поле `file`): изображение или видео для рилсов (роль продавец / **ADMIN**)

## Подключение фронта

В корне проекта создайте `.env`:

```
VITE_API_URL=http://localhost:3001
```

Запустите API (`server`), затем фронт (`npm run dev`). Каталог и заказы будут подгружаться с сервера.

## WebSocket (Socket.IO)

Сервер поднимает Socket.IO на том же порту, что и HTTP.

**Чат:**

- **join** — подписка на комнату: `socket.emit('join', 'room-id')`
- **message** — сообщение: `socket.emit('message', { room: 'room-id', text: '...' })`  
  Ответы: событие **message** с `{ text, at }`.

**Трекинг курьера:**

- **tracking:join** — подписка на заказ: `socket.emit('tracking:join', orderId)`  
  Сервер добавляет клиента в комнату `order-{orderId}`.
- **tracking:location** — курьер шлёт позицию: `socket.emit('tracking:location', { orderId, lat, lng })`  
  Сервер рассылает в комнату заказа и сохраняет в БД (не чаще раза в 30 с на заказ).  
  Подписчики получают событие **tracking:location**: `{ lat, lng }`.

## Трекинг и история

- В таблице **order_tracks** сохраняются точки маршрута (не чаще 1 записи в 30 с на заказ).
- На заказ хранится не более **500** точек; лишние удаляются при добавлении новых.
- Раз в сутки удаляются треки старше **7 дней** по доставленным/отменённым заказам.
