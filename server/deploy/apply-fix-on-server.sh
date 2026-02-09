#!/bin/bash
# Скрипт для применения исправлений циклической зависимости на сервере

set -e

echo "=== Применение исправлений циклической зависимости ==="

cd /var/www/gogomarket-api

# Создаем директории для исходников если их нет
mkdir -p src/auth src/users

# Скачиваем исправленные файлы напрямую с GitHub
echo "Скачивание исправленных модулей..."

curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/src/auth/auth.module.ts -o src/auth/auth.module.ts
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/src/users/users.module.ts -o src/users/users.module.ts

# Проверяем, что файлы скачались
if [ ! -f "src/auth/auth.module.ts" ] || [ ! -f "src/users/users.module.ts" ]; then
    echo "Ошибка: не удалось скачать файлы"
    exit 1
fi

echo "✓ Файлы скачаны"

# Проверяем наличие других необходимых файлов
if [ ! -f "src/main.ts" ]; then
    echo "Скачивание остальных исходников..."
    mkdir -p src/{app.module,entities,database,products,orders,media,health,metrics,chat}
    curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/src/main.ts -o src/main.ts
    curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/src/app.module.ts -o src/app.module.ts
    # И так далее... но проще пересобрать из репозитория
    echo "Рекомендуется пересобрать из репозитория"
fi

# Пересобираем API
echo ""
echo "Пересборка API..."
npm run build || {
    echo "Ошибка сборки. Попробуем установить зависимости..."
    npm install
    npm run build
}

# Перезапускаем
echo ""
echo "Перезапуск API..."
pm2 stop gogomarket-api 2>/dev/null || true
pm2 delete gogomarket-api 2>/dev/null || true
pm2 start dist/main.js --name gogomarket-api
pm2 save

# Ждем и проверяем
sleep 5
echo ""
echo "Проверка логов:"
pm2 logs gogomarket-api --lines 15 --nostream

echo ""
echo "Проверка порта:"
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
    curl -s http://localhost:3001/health | head -3
else
    echo "✗ Порт 3001 не слушается!"
fi

echo ""
echo "=== Готово ==="
