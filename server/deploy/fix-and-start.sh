#!/bin/bash
# Простой скрипт для исправления и запуска API

set -e

echo "=== Исправление и запуск API ==="

# Останавливаем старый процесс
pm2 stop gogomarket-api 2>/dev/null || true
pm2 delete gogomarket-api 2>/dev/null || true

# Переходим в директорию API
cd /var/www/gogomarket-api

# Проверяем переменные окружения БД
echo "Проверка переменных окружения БД..."
if [ ! -f ".env" ]; then
    echo "Создаем файл .env..."
    curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/check-env.sh | bash || true
fi

# Проверяем наличие dist/main.js
if [ ! -f "dist/main.js" ]; then
    echo "Ошибка: dist/main.js не найден!"
    exit 1
fi

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
fi

# Запускаем API
echo "Запуск API..."
pm2 start dist/main.js --name gogomarket-api
pm2 save

# Ждем запуска
echo "Ожидание запуска API..."
sleep 10

# Проверяем статус
if ! pm2 describe gogomarket-api >/dev/null 2>&1; then
    echo "Ошибка: API не запущен!"
    pm2 logs gogomarket-api --lines 50 --nostream
    exit 1
fi

# Проверяем порт
if ! ss -tlnp | grep -q ':3001'; then
    echo "Ошибка: Порт 3001 не слушается!"
    pm2 logs gogomarket-api --lines 50 --nostream
    exit 1
fi

# Проверяем health endpoint
HEALTH=$(curl -s --max-time 5 http://localhost:3001/health || echo "ERROR")
if [[ "$HEALTH" == *"ok"* ]] || [[ "$HEALTH" == *"GogoMarket"* ]] || [[ "$HEALTH" == *"status"* ]]; then
    echo "✓ API успешно запущен и работает"
    echo "$HEALTH" | head -3
else
    echo "Ошибка: API не отвечает правильно"
    echo "Ответ: $HEALTH"
    pm2 logs gogomarket-api --lines 50 --nostream
    exit 1
fi

echo "=== Готово ==="
