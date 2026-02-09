# Ручное применение исправлений деплоя

## Проблема
GitHub Actions не может обновить workflow файл из-за ограничений токена. Нужно применить исправления вручную.

## Шаг 1: Обновить workflow файл на GitHub

1. Откройте файл `.github/workflows/deploy.yml` на GitHub
2. Найдите секцию `Install API deps and restart (PM2)` (строка ~79)
3. Замените скрипт на:

```yaml
      - name: Install API deps and restart (PM2)
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          password: ${{ secrets.DEPLOY_PASSWORD }}
          port: 22
          script: |
            set -e
            cd /var/www/gogomarket-api
            mkdir -p uploads
            # Очищаем node_modules для избежания ошибки ENOTEMPTY
            rm -rf node_modules package-lock.json 2>/dev/null || true
            # Устанавливаем зависимости
            npm install --omit=dev --no-audit --no-fund --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps
            if ! command -v pm2 >/dev/null 2>&1; then
              echo "::warning::PM2 not installed. Installing PM2..."
              npm install -g pm2
            fi
            if pm2 describe gogomarket-api >/dev/null 2>&1; then
              pm2 restart gogomarket-api --update-env
            else
              pm2 start dist/main.js --name gogomarket-api
              pm2 save
            fi
            echo "API deploy done."
```

## Шаг 2: Применить исправления на сервере сейчас

Выполните на сервере:

```bash
ssh root@134.122.77.41

# Исправить API
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
pm2 restart gogomarket-api

# Применить конфигурацию Nginx
cd /var/www/gogotest  # или где находится проект
sudo cp deploy/nginx-default-with-api.conf /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl reload nginx

# Проверить
curl http://134.122.77.41/api/health
pm2 status
```

## Шаг 3: Проверить вход

1. Откройте http://134.122.77.41/login
2. Попробуйте войти с:
   - Email: `admin@gogomarket.local`
   - Пароль: `GogoAdmin123`

## Готовые скрипты

Если скрипты уже загружены на сервер:

```bash
ssh root@134.122.77.41
cd /var/www/gogomarket-api
bash ../gogotest/server/deploy/fix-api-deploy.sh
bash ../gogotest/server/deploy/apply-nginx-fix.sh
```
