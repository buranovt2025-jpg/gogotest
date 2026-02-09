# Инструкция по применению исправлений деплоя

## Проблема
GitHub Actions падает с ошибкой `ENOTEMPTY` при установке зависимостей API.

## Решение

### Вариант 1: Автоматический (через GitHub Actions)
После следующего пуша в main, workflow автоматически применит исправления.

### Вариант 2: Ручной (если нужно применить сейчас)

Выполните на сервере:

```bash
ssh root@134.122.77.41

# 1. Исправить API деплой
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
pm2 restart gogomarket-api

# 2. Применить конфигурацию Nginx
cd /var/www/gogotest  # или где находится проект
sudo cp deploy/nginx-default-with-api.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx

# 3. Проверить статус
pm2 status
curl http://localhost:3001/health
curl http://134.122.77.41/api/health
```

### Вариант 3: Использовать готовые скрипты

```bash
ssh root@134.122.77.41

# Загрузить скрипты (если их еще нет на сервере)
cd /var/www/gogomarket-api
# Или склонировать репозиторий

# Применить исправления API
bash server/deploy/fix-api-deploy.sh

# Применить конфигурацию Nginx
bash server/deploy/apply-nginx-fix.sh
```

## Проверка

После применения исправлений проверьте:

1. **API работает:**
   ```bash
   curl http://134.122.77.41/api/health
   ```

2. **Вход работает:**
   - Откройте http://134.122.77.41/login
   - Попробуйте войти с `admin@gogomarket.local` / `GogoAdmin123`

3. **Логи:**
   ```bash
   pm2 logs gogomarket-api --lines 50
   sudo tail -f /var/log/nginx/error.log
   ```

## Если проблемы остались

1. Проверьте, что API запущен: `pm2 list`
2. Проверьте логи: `pm2 logs gogomarket-api`
3. Проверьте конфигурацию Nginx: `sudo nginx -t`
4. Проверьте, что порт 3001 слушается: `netstat -tlnp | grep 3001`
