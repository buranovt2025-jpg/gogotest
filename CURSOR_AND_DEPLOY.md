# Готовность к Cursor и деплою на Digital Ocean

## Чек-лист перед переносом

- **Фронтенд:** Vite + React + TypeScript, готов к сборке (`npm run build` → `dist/`).
- **AI:** Gemini подключён через `src/lib/gemini.ts` и `geminiService` (нужен `VITE_GEMINI_API_KEY` в .env).
- **Локализация:** RU/UZ/EN в `LocaleContext`, `translations.ts`, переключатель в шапке.
- **UX:** Адаптивная вёрстка, viewport и PWA-метатеги для нативного вида на смартфоне.
- **PWA:** В `index.html` добавлены theme-color, viewport-fit=cover, apple-mobile-web-app-*, ссылка на `manifest.json` (в `public/manifest.json`).

## Сохранение в Cursor / первый коммит

1. Папка проекта уже есть (например `gogomarket`).
2. В Cursor открыть эту папку.
3. В терминале: `npm install`, затем `npm run build` (проверка).
4. Git:
   ```bash
   git init
   git add .
   git commit -m "Initial architecture v3.0"
   ```
5. Создать репозиторий на GitHub, привязать: `git remote add origin <url>`, `git push -u origin main`.

## Digital Ocean

- **App Platform:** в панели DO выбрать App Platform → создать из GitHub репозитория. Указать корень проекта; сборка по умолчанию подхватит Vite (Build Command: `npm run build`, Output Dir: `dist`). Добавить переменные окружения: `VITE_GEMINI_API_KEY`, `VITE_API_URL` (URL бэкенда), при необходимости `VITE_YANDEX_MAPS_KEY` (карта трекинга). Бэкенд (NestJS) разворачивать отдельным сервисом с `DATABASE_URL`, `JWT_SECRET`, при использовании медиа — S3-переменные (см. `server/.env.example`).
- **Droplet (Nginx):** уже настроен автодеплой через GitHub Actions (см. `.github/workflows/deploy.yml`, `DEPLOY_DIGITAL_OCEAN.md`). После push в `main` артефакты копируются в `/var/www/html`, Nginx отдаёт SPA.

## Файлы для проверки связей

- `index.html` — точка входа, PWA-метатеги.
- `public/manifest.json` — манифест приложения.
- `metadata.json` — краткое описание проекта и версии (для людей/документации).
- `.env.example` и `server/.env.example` — переменные окружения фронта и API.

После деплоя: проверить главную, смену языка, каталог, корзину, чат и при необходимости логику заказов/БД (см. WORK_LOG.md).
