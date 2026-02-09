#!/bin/bash
# Скрипт для пересборки API с исправлениями

set -e

echo "=== Пересборка API ==="

# Проверяем, есть ли исходники
if [ -d "/var/www/gogotest" ]; then
    echo "Найден репозиторий в /var/www/gogotest"
    cd /var/www/gogotest/server
elif [ -d "/var/www/gogomarket-api/src" ]; then
    echo "Найдены исходники в /var/www/gogomarket-api"
    cd /var/www/gogomarket-api
else
    echo "Исходники не найдены. Клонируем репозиторий..."
    cd /var/www
    if [ ! -d "gogotest" ]; then
        git clone https://github.com/buranovt2025-jpg/gogotest.git
    fi
    cd gogotest/server
fi

echo ""
echo "Обновление кода..."
git pull origin main || echo "Не удалось обновить (возможно, нет git)"

echo ""
echo "Установка зависимостей..."
npm install

echo ""
echo "Сборка API..."
npm run build

echo ""
echo "Копирование собранных файлов..."
mkdir -p /var/www/gogomarket-api/dist
cp -r dist/* /var/www/gogomarket-api/dist/
cp package.json package-lock.json /var/www/gogomarket-api/

echo ""
echo "Перезапуск API..."
cd /var/www/gogomarket-api
pm2 stop gogomarket-api || true
pm2 delete gogomarket-api || true
pm2 start dist/main.js --name gogomarket-api
pm2 save

echo ""
echo "Ожидание запуска..."
sleep 5

echo ""
echo "Проверка логов:"
pm2 logs gogomarket-api --lines 20 --nostream

echo ""
echo "Проверка порта:"
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
    curl -s http://localhost:3001/health | head -3
else
    echo "✗ Порт 3001 не слушается!"
    echo "Проверьте логи: pm2 logs gogomarket-api"
fi

echo ""
echo "=== Готово ==="
