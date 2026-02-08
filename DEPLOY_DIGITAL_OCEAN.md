# Развёртывание на Digital Ocean

## Репозиторий
**GitHub:** https://github.com/buranovt2025-jpg/gogotest

## Сервер (Droplet)
- **IPv4:** 134.122.77.41
- **Регион:** FRA1 (Frankfurt)
- **ОС:** Ubuntu 24.04 LTS

---

## Автодеплой (GitHub Actions)

При каждом **push в ветку main** проект собирается и выгружается на сервер.

### 1. Один раз на сервере: установить Nginx

```bash
ssh root@134.122.77.41
apt-get update && apt-get install -y nginx
mkdir -p /var/www/html
systemctl enable nginx && systemctl start nginx
```

Либо выполнить скрипт из репозитория: `bash scripts/server-setup.sh`

**SPA (React Router):** чтобы при обновлении страницы на `/buyer`, `/seller` и т.д. не было 404, в конфиге Nginx для сайта в блок `location /` добавьте: `try_files $uri $uri/ /index.html;` (пример в `deploy/nginx-spa.conf`).

### 2. Секреты в GitHub

В репозитории: **Settings → Secrets and variables → Actions → New repository secret.**

Добавить три секрета:

| Name | Value | Пример |
|------|--------|--------|
| `DEPLOY_HOST` | IP сервера | `134.122.77.41` |
| `DEPLOY_USER` | пользователь SSH | `root` |
| `DEPLOY_PASSWORD` | пароль root | ваш пароль |

После этого каждый `git push origin main` запускает сборку и деплой **фронта** и **API**.

### 3. Один раз на сервере: Node.js и PM2 для API

API выкладывается в `/var/www/gogomarket-api/`. Чтобы он запускался при деплое, на сервере должны быть Node.js 20 и PM2:

```bash
ssh root@134.122.77.41
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

В `/var/www/gogomarket-api/` создайте файл `.env` (вручную, не из репо) с переменными: `DATABASE_URL`, `JWT_SECRET`, при необходимости `PORT`, `S3_*` и т.д. (см. `server/.env.example`). При первом деплое workflow запустит приложение через `pm2 start`; при следующих — `pm2 restart gogomarket-api`.

Проксирование запросов к API с Nginx (опционально): в конфиг Nginx добавьте `location /api/ { proxy_pass http://127.0.0.1:3001/; }` и на фронте задайте `VITE_API_URL` с этим путём.

---

## Вариант вручную: загрузка dist на сервер

1. Локально: `npm run build` (папка `dist/` готова).
2. Загрузить **содержимое** `dist/` в `/var/www/html` на сервере:

   ```bash
   scp -r dist/* root@134.122.77.41:/var/www/html/
   ```

   При запросе введите пароль root.

3. На сервере должен быть установлен Nginx (или Apache), чтобы раздавать файлы из `/var/www/html`.

---

## Вариант 2: Клонировать репо на сервер и собирать там

На сервере:

```bash
ssh root@134.122.77.41
apt update && apt install -y nodejs npm nginx
git clone https://github.com/buranovt2025-jpg/gogotest.git /var/www/gogotest
cd /var/www/gogotest
npm install
npm run build
cp -r dist/* /var/www/html/
```

Дальше настроить Nginx на раздачу из `/var/www/html` (или из папки с `dist`).

---

## После деплоя

- Сайт будет доступен по адресу: `http://134.122.77.41`
- Для HTTPS: получить сертификат (например, Let's Encrypt) и настроить Nginx.

Конфиги Nginx и скрипты деплоя лежат в репозитории (например, `scripts/server-setup.sh`).
