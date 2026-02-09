#!/bin/bash
# Скрипт для исправления проблем с деплоем API

set -e

cd /var/www/gogomarket-api

echo "Очистка node_modules..."
if [ -d "node_modules" ]; then
  rm -rf node_modules
fi

echo "Установка зависимостей..."
npm install --omit=dev --no-audit --no-fund

echo "Проверка PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  echo "PM2 не установлен. Установка PM2..."
  npm install -g pm2
fi

echo "Перезапуск API..."
if pm2 describe gogomarket-api >/dev/null 2>&1; then
  pm2 restart gogomarket-api --update-env
else
  pm2 start dist/main.js --name gogomarket-api
  pm2 save
fi

echo "Проверка статуса API..."
pm2 status gogomarket-api

echo "Готово!"
