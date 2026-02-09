#!/bin/bash
# Быстрое исправление - клонирует репозиторий, пересобирает и перезапускает

set -e

echo "=== Быстрое исправление API ==="

# Клонируем/обновляем репозиторий
cd /var/www
if [ -d "gogotest" ]; then
    cd gogotest && git pull origin main
else
    git clone https://github.com/buranovt2025-jpg/gogotest.git
    cd gogotest
fi

# Пересобираем API
echo "Пересборка API..."
cd server
npm install
npm run build

# Копируем
echo "Копирование файлов..."
cp -r dist/* /var/www/gogomarket-api/dist/
cp package.json package-lock.json /var/www/gogomarket-api/

# Перезапускаем
echo "Перезапуск API..."
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

pm2 stop gogomarket-api 2>/dev/null || true
pm2 delete gogomarket-api 2>/dev/null || true
pm2 start dist/main.js --name gogomarket-api
pm2 save

sleep 5

# Проверка
echo ""
echo "Проверка:"
pm2 status gogomarket-api
ss -tlnp | grep 3001 || echo "Порт не слушается!"
curl -s http://localhost:3001/health | head -3 || echo "API не отвечает"

echo ""
echo "=== Готово ==="
