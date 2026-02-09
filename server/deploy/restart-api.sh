#!/bin/bash
# Скрипт для перезапуска API после исправления циклической зависимости

set -e

echo "=== Перезапуск API ==="

cd /var/www/gogomarket-api

# Останавливаем старый процесс
pm2 stop gogomarket-api || true
pm2 delete gogomarket-api || true

# Проверяем, что dist/main.js существует
if [ ! -f "dist/main.js" ]; then
    echo "Ошибка: dist/main.js не найден!"
    echo "Нужно собрать проект: npm run build"
    exit 1
fi

# Запускаем API
pm2 start dist/main.js --name gogomarket-api
pm2 save

# Ждем запуска
sleep 3

# Проверяем логи
echo ""
echo "Логи API:"
pm2 logs gogomarket-api --lines 20 --nostream

# Проверяем статус
echo ""
echo "Статус PM2:"
pm2 status gogomarket-api

# Проверяем порт
echo ""
echo "Проверка порта 3001:"
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
    ss -tlnp | grep ':3001'
else
    echo "✗ Порт 3001 не слушается!"
fi

# Проверяем health endpoint
echo ""
echo "Проверка health endpoint:"
curl -s http://localhost:3001/health | head -3 || echo "API не отвечает!"

echo ""
echo "=== Готово ==="
