# GogoMarket

Проект для развёртывания на Digital Ocean (или любой хостинг).

## Локальный запуск

```bash
npm install
npm run build
```

После сборки папка `dist/` содержит готовый статический сайт.

## Развёртывание

### Digital Ocean Droplet (сервер)

Загрузите **содержимое** папки `dist/` в `/var/www/html` на сервере.

### Digital Ocean App Platform

Загрузите проект на GitHub. App Platform соберёт его автоматически.  
В настройках добавьте переменные окружения (например, `API_KEY`) в **Environment Variables**.

### Nginx / Docker

Если нужны конфиги для Nginx или Docker — запросите отдельно.
