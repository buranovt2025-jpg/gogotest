#!/bin/bash
# Скрипт для проверки и исправления API

set -e

echo "=== Проверка API ==="

# 1. Проверка порта
echo ""
echo "1. Проверка порта 3001:"
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
    ss -tlnp | grep ':3001'
else
    echo "✗ Порт 3001 не слушается!"
    echo "Проверяем PM2..."
    pm2 status
    echo ""
    echo "Проверяем логи PM2:"
    pm2 logs gogomarket-api --lines 20 --nostream
    exit 1
fi

# 2. Проверка локального доступа
echo ""
echo "2. Проверка локального доступа к API:"
LOCAL_RESPONSE=$(curl -s http://localhost:3001/health || echo "ERROR")
if [[ "$LOCAL_RESPONSE" == *"ok"* ]] || [[ "$LOCAL_RESPONSE" == *"GogoMarket"* ]]; then
    echo "✓ API отвечает локально"
    echo "$LOCAL_RESPONSE" | head -3
else
    echo "✗ API не отвечает локально!"
    echo "Ответ: $LOCAL_RESPONSE"
    echo ""
    echo "Проверяем логи PM2:"
    pm2 logs gogomarket-api --lines 30 --nostream
    echo ""
    echo "Перезапускаем API..."
    cd /var/www/gogomarket-api
    pm2 restart gogomarket-api
    sleep 2
    pm2 logs gogomarket-api --lines 10 --nostream
    exit 1
fi

# 3. Проверка через Nginx
echo ""
echo "3. Проверка через Nginx:"
NGINX_RESPONSE=$(curl -s http://134.122.77.41/api/health || echo "ERROR")
if [[ "$NGINX_RESPONSE" == *"ok"* ]] || [[ "$NGINX_RESPONSE" == *"GogoMarket"* ]]; then
    echo "✓ API отвечает через Nginx"
    echo "$NGINX_RESPONSE" | head -3
else
    echo "✗ API не отвечает через Nginx!"
    echo "Ответ: $NGINX_RESPONSE"
    echo ""
    echo "Проверяем логи Nginx:"
    sudo tail -10 /var/log/nginx/error.log
fi

echo ""
echo "=== Проверка завершена ==="
