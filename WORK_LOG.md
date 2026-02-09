# Журнал работ GogoMarket

**Назначение:** единый журнал — что сделано, что делать дальше, точка возврата. Не засоряем основное ТЗ (SPEC_ALIGNMENT и др.). После каждой значимой работы — автосохранение сюда, чтобы в другой сессии открыть и продолжить.

---

## Сделано

- Роли и типы: SELLER_FULL / SELLER_SIMPLE, Buyer/Seller/Courier/Admin по ТЗ.
- Gemini: генерация описаний (Seller), GOGO AI Помощник в чате (ChatView).
- Рилсы и истории в Buyer (вкладки, привязка к productId).
- Чат: экран ChatView, переход «Связаться» → `/chat?product=...`.
- Споры: открытие в Buyer, вкладка «Споры» в Admin, решение в 48 ч (refund_full/partial, reject).
- Языки RU/UZ/EN: LocaleContext, translations, useTranslation; все экраны переведены (Home, Layout, Buyer, Seller, Courier, Admin, BuyerProduct, ChatView).
- Бэкенд: NestJS API в `server/` — health, products, orders, orders/disputes, POST orders, PATCH dispute/open, PATCH dispute/resolve. In-memory хранение.
- Фронт + API: при заданном `VITE_API_URL` каталог и заказы с сервера (CatalogContext, useOrders, useDisputes).
- WebSocket: ChatGateway в server (Socket.IO, события join, message); на фронте `src/api/ws.ts` (getSocket).
- Чат real-time: в ChatView при включённом API — подключение к WS, join комнаты `product-{id}` или `general`, приём события `message` и вывод в ленту (вместе с ответами Gemini).
- Docker: `server/docker-compose.yml` — PostgreSQL для будущего подключения БД.
- Деплой: GitHub Actions → Digital Ocean, Nginx SPA fallback.
- Готовность к Cursor и DO: PWA-метатеги в index.html (theme-color, viewport-fit=cover, apple-mobile-web-app-*), public/manifest.json, metadata.json; чек-лист и шаги Git/DO в CURSOR_AND_DEPLOY.md.
- **Phase 1 (MVP) — ядро бэкенда:** README обновлён архитектурными решениями. В server: TypeORM + PostgreSQL (DatabaseModule, entities User, Product, Order), Auth (JWT: login/register, JwtStrategy, JwtAuthGuard, RolesGuard), продукты и заказы через репозитории, сиды при старте. POST /orders и эндпоинты споров защищены по ролям (BUYER/ADMIN). server/.env.example: DATABASE_URL, JWT_SECRET.
- **Фронт + JWT:** AuthContext (token/user в localStorage), страница /login (вход и регистрация с выбором роли). API-клиент передаёт Bearer token в POST /orders, PATCH dispute, PATCH dispute/resolve. В шапке при API: кнопка «Войти» или email + «Выйти». В Buyer и Admin при неавторизованном пользователе — подсказка и переход на /login при оформлении заказа, открытии спора, решении спора. Admin передаёт user.id в resolveDispute.
- **MVP-цикл «Покупка → Продавец → Курьер»:** В Order добавлено поле assignedToCourierId. Статусы: Новый → Подтверждён (продавец) → В пути (назначен курьер) → Доставлен. API: GET orders/new-for-seller (Seller), PATCH :id/confirm (Seller), GET users/couriers (Admin), PATCH orders/:id/assign (Admin), GET orders/my-deliveries (Courier), PATCH orders/:id/status (Courier). Фронт: Seller — блок «Новые заказы» и кнопка «Подтвердить»; Admin — вкладка «Заказы», выбор курьера и «Назначить»; Courier — список «Мои доставки» и «Отметить доставленным».
- **Phase 2 — медиа:** В Product добавлены поля imageUrl, videoUrl. Модуль Media: POST /media/upload (Multer, до 80 МБ), загрузка в S3 (DO Spaces) при заданных S3_* или в локальную папку uploads с раздачей по /uploads/. Продукты: POST /products, PATCH /products/:id (Seller/Admin) с полями imageUrl, videoUrl. Фронт: ApiProduct + imageUrl, videoUrl; apiUploadMedia(file), apiCreateProduct, apiUpdateProduct; CatalogContext.refetch(); Seller — блок «Добавить в каталог» (имя, цена, описание, тип, фото/видео для рилса) → загрузка файлов и создание товара; Buyer — в рилсах показ video или image по URL, при отсутствии — градиент.
- **Phase 3 — трекинг и карты:** WebSocket (ChatGateway): события tracking:join (клиент входит в комнату order-{id}), tracking:location (курьер отправляет { orderId, lat, lng }, сервер рассылает в комнату). Фронт: хук useTracking(orderId) — подписка на tracking:location и состояние { lat, lng }; компонент TrackingMap (Yandex Maps 2.1, скрипт по VITE_YANDEX_MAPS_KEY, маркер позиции). Buyer: для заказов со статусом «В пути» кнопка «Отслеживать» → карта и подписка на позицию; Courier: кнопка «Отправить мою позицию» (geolocation + emit tracking:location). i18n: trackOrder, trackOrderHint, sendMyLocation.
- **Трекинг — улучшения:** В Order (БД) добавлены lastCourierLat, lastCourierLng, lastCourierAt. При получении tracking:location сервер сохраняет позицию в заказ (OrdersService.updateCourierPosition). API возвращает эти поля в GET /orders. Buyer: при открытии «Отслеживать» карта показывает последнюю сохранённую позицию (initialLat/initialLng) до первого обновления по WS. Courier: чекбокс «Авто-отправка позиции каждые 30 с» — при включении раз в 30 с отправляется геолокация по всем заказам «В пути». i18n: autoSendLocation.
- **История треков и throttle:** Сущность OrderTrack (orderId, lat, lng, createdAt). При tracking:location запись в Order (last*) и в OrderTrack выполняется не чаще раза в 30 с (TRACK_THROTTLE_MS). GET /orders/:id/tracks (JWT) — история точек для заказа (доступ: покупатель заказа, курьер заказа, админ). Фронт: apiOrderTracks(orderId), при открытии «Отслеживать» загрузка истории и передача в TrackingMap; на карте рисуется полилиния маршрута (Yandex Polyline).
- **Лимит и очистка треков:** На заказ хранится не более 500 точек (trimTracksForOrder после каждой записи). Раз в сутки удаляются треки старше 7 дней по доставленным/отменённым заказам (cleanupOldTracks в onModuleInit и setInterval 24 ч). README server обновлён (все эндпоинты, S3, WS трекинг, лимиты). Корневой README и .env.example: VITE_YANDEX_MAPS_KEY.
- **Rate limiting и health:** ThrottlerModule — 120 запросов/мин на IP; /health не лимитируется (SkipThrottle). Эндпоинты /auth — 10 запросов/мин на IP. Health возвращает ok, service, version, ts (ISO). Smoke-тест: `npm run test` в server (node test/health-check.mjs) при запущенном API. Helmet подключён (security headers). Фронт: при 429 API-клиент бросает ошибку rateLimitExceeded; на странице входа показывается перевод (ru/uz/en) «Слишком много запросов. Подождите минуту».
- **Документация и UX:** В README добавлена секция «Локальная разработка с API и БД» (Postgres docker, server .env, два терминала, проверка health). В server/docker-compose.yml убрана устаревшая пометка in-memory. На странице регистрации доступны обе роли продавца: SELLER_FULL (Инвентарь) и SELLER_SIMPLE (Объявления).
- **E2E (Playwright):** Установлен @playwright/test, конфиг playwright.config.ts (webServer: build + preview на порту 4173), тесты в e2e/home.spec.ts (загрузка главной, заголовок GogoMarket, наличие навигации). Скрипт `npm run test:e2e`. В README добавлена секция про E2E; в .gitignore — test-results, playwright-report.
- **E2E — расширение:** e2e/login.spec.ts — загрузка /login, ссылка «Назад», наличие подсказки про API или формы входа (email). e2e/buyer.spec.ts — загрузка /buyer, заголовок (Покупатель/Xaridor/Buyer), кнопка вкладки Каталог.
- **Метрики (Prometheus):** GET /metrics — текст в формате Prometheus: gauge gogomarket_info{version}, gauge gogomarket_uptime_seconds, counter gogomarket_http_requests_total, counter gogomarket_http_requests_by_route{method,path} (path нормализован: UUID/числа → :id). MetricsService + MetricsInterceptor. Эндпоинт не лимитируется (SkipThrottle). Описание в server/README.md.
- **Алерты и дашборд:** server/deploy/ — пример скрапа Prometheus (prometheus-scrape.example.yml), правила алертов (prometheus-alerts.example.yml: GogoMarketDown, GogoMarketHighRequestRate), пример Alertmanager (alertmanager.example.yml: маршруты по severity, заготовки Slack/email/webhook), дашборд Grafana (grafana-dashboard.example.json: uptime, total, RPS, график и таблица по маршрутам). deploy/README.md с описанием.
- **E2E с авторизацией и заказом:** e2e/auth-order.spec.ts — при наличии VITE_API_URL при сборке: регистрация (уникальный email), переход в каталог, добавление товара в корзину, оформление заказа; проверка появления заказа со статусом «Новый». Без API тест пропускается (подсказка на /login). В README — секция «E2E с API».
- **Деплой на DO (полный):** Workflow собирает фронт (с VITE_API_URL=http://DEPLOY_HOST/api) и API, выкладывает в /var/www/html и /var/www/gogomarket-api; Nginx — полный конфиг (SPA + location /api/ → 3001); шаг «Install API deps and restart» (npm ci, pm2, mkdir uploads, fallback при отсутствии PM2). Скрипты: server/deploy/create-env-on-server.sh, install-postgres.sh. DEPLOY_DIGITAL_OCEAN.md — Node, PM2, .env, прокси.
- **Auth в проде:** Seed-пользователь admin@gogomarket.local / GogoAdmin123 создаётся при старте API, если такого email ещё нет. OPTIONS для /auth/login и /auth/register (устранение 405 от preflight). Фронт: fallback API base = origin + '/api', если VITE_API_URL пустой при сборке (устранение «HTML вместо JSON»). Сообщения об ошибках: «Сервер недоступен», «Неверный email или пароль».
- **Lighthouse (a11y, SEO, Best Practices):** На /login — подписи полей (htmlFor/id), контраст (цвета текста/рамок), табы с role/aria. public/robots.txt (User-agent: * / Allow: /). Nginx: заголовки X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- **Alertmanager — примеры каналов:** В alertmanager.example.yml добавлены готовые закомментированные блоки для Slack (api_url, channel), Telegram (webhook/пром-сервис), email; в README — как подставить свои данные.

---

## Сделать дальше

1. (Резерв) По желанию: раскомментировать и заполнить Slack/Telegram/email в server/deploy/alertmanager.example.yml под свои ключи.

---

## Деплой (что задеплоено и что сделать)

- **GitHub Actions** (`.github/workflows/deploy.yml`): при push в `main` собираются **фронт** и **API**, выгружаются на сервер: фронт в `/var/www/html`, API в `/var/www/gogomarket-api/`; затем на сервере выполняется `npm ci --omit=dev` в каталоге API и `pm2 restart gogomarket-api` (или `pm2 start` при первом запуске). Нужны секреты: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PASSWORD`. Один раз на сервере: Node 20, PM2, в `/var/www/gogomarket-api/.env` — `DATABASE_URL`, `JWT_SECRET` (см. DEPLOY_DIGITAL_OCEAN.md).

---

## Точка возврата (последнее состояние)

- **Дата:** 2026-02-08
- **Состояние:** В deploy добавлены примеры Slack/Telegram/email для Alertmanager. Деплой на 134.122.77.41 в работе; при появлении домена — HTTPS.
- **Как продолжить:** WORK_LOG.md → «Сделать дальше»; деплой — push в main; при появлении домена — HTTPS (Let's Encrypt), обновить VITE_API_URL и Nginx.

---

*После каждой сессии обновляй блоки «Сделано», «Сделать дальше» и «Точка возврата».*
