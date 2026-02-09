#!/bin/bash
# Автоматическое исправление API - выполняется через GitHub Actions

set -e

echo "=== Автоматическое исправление API ==="

# Переходим в рабочую директорию
cd /var/www

# Клонируем/обновляем репозиторий
if [ -d "gogotest" ]; then
    echo "Обновление репозитория..."
    cd gogotest
    git pull origin main || echo "Не удалось обновить (продолжаем)"
else
    echo "Клонирование репозитория..."
    git clone https://github.com/buranovt2025-jpg/gogotest.git
    cd gogotest
fi

# Пересобираем API
echo "Пересборка API..."
cd server
npm install
npm run build

if [ ! -f "dist/main.js" ]; then
    echo "Ошибка: сборка не удалась!"
    exit 1
fi

# Копируем собранные файлы
echo "Копирование файлов..."
mkdir -p /var/www/gogomarket-api/dist
cp -r dist/* /var/www/gogomarket-api/dist/
cp package.json package-lock.json /var/www/gogomarket-api/

# Устанавливаем зависимости
echo "Установка зависимостей..."
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

# Перезапускаем API
echo "Перезапуск API..."
if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2
fi

pm2 stop gogomarket-api 2>/dev/null || true
pm2 delete gogomarket-api 2>/dev/null || true
pm2 start dist/main.js --name gogomarket-api
pm2 save

# Ждем запуска
sleep 5

# Проверка
echo ""
echo "Проверка:"
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
    HEALTH=$(curl -s http://localhost:3001/health || echo "ERROR")
    if [[ "$HEALTH" == *"ok"* ]] || [[ "$HEALTH" == *"GogoMarket"* ]]; then
        echo "✓ API работает"
        echo "$HEALTH" | head -3
    else
        echo "✗ API не отвечает правильно"
        pm2 logs gogomarket-api --lines 20 --nostream
        exit 1
    fi
else
    echo "✗ Порт 3001 не слушается!"
    pm2 logs gogomarket-api --lines 30 --nostream
    exit 1
fi

echo ""
echo "=== Готово! ==="
