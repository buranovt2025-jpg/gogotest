# GogoMarket

Маркетплейс: 4 роли (Покупатель, Продавец, Курьер, Админ), ИИ-описания (Gemini).

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

Папка `dist/` — готовый статический сайт для хостинга.

## SPA на сервере

Чтобы при обновлении страницы на `/buyer`, `/seller` и т.д. не было 404, в Nginx добавьте в `location /`:  
`try_files $uri $uri/ /index.html;`  
Пример: `deploy/nginx-spa.conf`.

## Переменные окружения

- `VITE_GEMINI_API_KEY` — ключ Google AI (Gemini) для генерации описаний товаров у продавца. Необязательно: без ключа показывается подсказка. Пример: `.env.example`.

## Развёртывание

### Digital Ocean Droplet (сервер)

Загрузите **содержимое** папки `dist/` в `/var/www/html` на сервере.

### Digital Ocean App Platform

Загрузите проект на GitHub. App Platform соберёт его автоматически.  
В настройках добавьте переменные окружения (например, `API_KEY`) в **Environment Variables**.

### Nginx / Docker

Если нужны конфиги для Nginx или Docker — запросите отдельно.
