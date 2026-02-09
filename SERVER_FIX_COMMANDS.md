# Команды для исправления на сервере

Выполните эти команды на сервере по порядку:

## 1. Исправить API (установка зависимостей)

```bash
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
pm2 restart gogomarket-api
pm2 status
```

## 2. Применить конфигурацию Nginx

```bash
# Проверить, где находится проект
ls -la /var/www/ | grep gogo

# Если проект в /var/www/gogotest:
cd /var/www/gogotest
sudo cp deploy/nginx-default-with-api.conf /etc/nginx/sites-available/default

# Или если проекта нет, скопировать конфиг напрямую:
sudo nano /etc/nginx/sites-available/default
# Вставить содержимое из deploy/nginx-default-with-api.conf

# Проверить и перезагрузить
sudo nginx -t
sudo systemctl reload nginx
```

## 3. Проверить работу

```bash
# Проверить API
curl http://localhost:3001/health
curl http://134.122.77.41/api/health

# Проверить PM2
pm2 logs gogomarket-api --lines 20

# Проверить Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## 4. Проверить вход

Откройте в браузере: http://134.122.77.41/login

Попробуйте войти:
- Email: `admin@gogomarket.local`
- Пароль: `GogoAdmin123`
