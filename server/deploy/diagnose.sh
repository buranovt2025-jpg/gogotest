#!/bin/bash
# Диагностика проблем с API

echo "=== Диагностика API ==="
echo ""

echo "1. Проверка PM2:"
pm2 status || echo "PM2 не установлен или не работает"
echo ""

echo "2. Проверка процесса API:"
pm2 describe gogomarket-api 2>/dev/null || echo "Процесс gogomarket-api не найден в PM2"
echo ""

echo "3. Проверка порта 3001:"
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
    ss -tlnp | grep ':3001'
else
    echo "✗ Порт 3001 не слушается"
fi
echo ""

echo "4. Последние логи API (50 строк):"
pm2 logs gogomarket-api --lines 50 --nostream 2>/dev/null || echo "Не удалось получить логи"
echo ""

echo "5. Проверка health endpoint:"
HEALTH=$(curl -s --max-time 5 http://localhost:3001/health || echo "ERROR")
if [[ "$HEALTH" == *"ok"* ]] || [[ "$HEALTH" == *"GogoMarket"* ]] || [[ "$HEALTH" == *"status"* ]]; then
    echo "✓ API отвечает"
    echo "$HEALTH" | head -5
else
    echo "✗ API не отвечает"
    echo "Ответ: $HEALTH"
fi
echo ""

echo "6. Проверка файлов API:"
if [ -f "/var/www/gogomarket-api/dist/main.js" ]; then
    echo "✓ dist/main.js существует"
    ls -lh /var/www/gogomarket-api/dist/main.js
else
    echo "✗ dist/main.js не найден"
fi
echo ""

echo "7. Проверка node_modules:"
if [ -d "/var/www/gogomarket-api/node_modules" ]; then
    echo "✓ node_modules существует"
    ls -d /var/www/gogomarket-api/node_modules/*/ | wc -l | xargs echo "Количество модулей:"
else
    echo "✗ node_modules не найден"
fi
echo ""

echo "=== Конец диагностики ==="
