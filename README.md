# GogoMarket

Маркетплейс: 4 роли, ИИ (Gemini), споры, переключатель языков **RU / UZ / EN**.

## Архитектурные решения (для бэкенда)

**Приоритет фич:**  
- **Phase 1 (MVP):** БД (PostgreSQL) + Авторизация (JWT/SMS) + основной цикл заказа (создание → статусы).  
- **Phase 2:** Медиа (S3/FFmpeg) — критично для «социальности».  
- **Phase 3:** Трекинг (WebSocket) и карты.

**Хостинг:** Фронт — DO App Platform (Static Site). API — DO App Platform (Web Service). Масштабирование независимое. Домен обязателен для JWT и Cookie.

**Пользователи и роли:** Реальный JWT. Роли Buyer, Seller, Courier, Admin жёстко разграничены на API (Guards в NestJS). Переключатель ролей на фронте — только для разработки/демо.

**Рилсы/истории:** В MVP — S3 (Digital Ocean Spaces). Загрузка реальных медиа — киллер-фича.

**Стек:** NestJS + TypeORM + PostgreSQL. Чаты — Socket.io. Карты — Yandex Maps API.

**Дедлайн MVP:** 4 недели. Цель — рабочий цикл «Покупка → Уведомление продавца → Назначение курьера».

## Локальный запуск

```bash
npm install
npm run dev
```

Откроется http://localhost:5173 с горячей перезагрузкой.

## Сборка

```bash
npm run build
```

## E2E тесты (Playwright)

Первый запуск: `npx playwright install chromium`. Затем:

```bash
npm run test:e2e
```

Скрипт сам соберёт приложение, поднимет `vite preview` и проверит загрузку главной, /login, /buyer и навигацию.

**E2E с API (регистрация и заказ):** тест в `e2e/auth-order.spec.ts` выполняется только если при сборке задан `VITE_API_URL` (тогда на /login показывается форма входа). Запуск: поднять БД и API (`cd server && npm run start:dev`, порт 3001), в корне собрать с `VITE_API_URL=http://localhost:3001` и запустить `npm run test:e2e`. Без API тест пропускается.

Папка `dist/` — готовый статический сайт для хостинга.

## SPA на сервере

Чтобы при обновлении страницы на `/buyer`, `/seller` и т.д. не было 404, в Nginx добавьте в `location /`:  
`try_files $uri $uri/ /index.html;`  
Пример: `deploy/nginx-spa.conf`.

## API (бэкенд)

В папке `server/` — NestJS-API (каталог, заказы, споры). Запуск:

```bash
cd server && npm install && npm run start:dev
```

Если в `.env` задать `VITE_API_URL=http://localhost:3001`, фронт будет брать каталог и заказы с API вместо статики и localStorage. Подробнее: `server/README.md`.

### Локальная разработка с API и БД

1. **PostgreSQL:** в папке `server/` выполнить `docker compose up -d` (если ещё не запущен). В `server/.env` задать `DATABASE_URL=postgresql://gogomarket:gogomarket@localhost:5432/gogomarket` и `JWT_SECRET` (минимум 32 символа).
2. **API:** в одном терминале — `cd server && npm run start:dev`. Убедиться, что в консоли есть строка `GogoMarket API http://localhost:3001`.
3. **Фронт:** в корне проекта в `.env` задать `VITE_API_URL=http://localhost:3001`, в другом терминале — `npm run dev`. Открыть http://localhost:5173.
4. **Проверка API:** `curl http://localhost:3001/health` или в папке server — `npm run test` (при запущенном API).

## Переменные окружения

- `VITE_GEMINI_API_KEY` — ключ Google AI (Gemini) для генерации описаний товаров у продавца. Необязательно: без ключа показывается подсказка.
- `VITE_API_URL` — базовый URL API (опционально). Пример: `.env.example`.
- `VITE_YANDEX_MAPS_KEY` — ключ Yandex Maps API 2.1 для карты трекинга заказа. Необязательно: без ключа карта показывает заглушку.

## Развёртывание

### Digital Ocean Droplet (сервер)

Загрузите **содержимое** папки `dist/` в `/var/www/html` на сервере.

### Digital Ocean App Platform

Загрузите проект на GitHub. App Platform соберёт его автоматически.  
В настройках добавьте переменные окружения (например, `API_KEY`) в **Environment Variables**.

### Nginx / Docker

Если нужны конфиги для Nginx или Docker — запросите отдельно.
