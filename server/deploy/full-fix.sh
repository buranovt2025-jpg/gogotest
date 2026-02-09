#!/bin/bash
# Полное исправление: установка БД, создание .env, пересборка API

set -e

echo "=== Полное исправление GogoMarket API ==="

# 1. Устанавливаем PostgreSQL если нужно
echo ""
echo "1. Проверка PostgreSQL..."
if ! command -v psql >/dev/null 2>&1; then
    echo "PostgreSQL не установлен, устанавливаем..."
    curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/install-postgres.sh | sudo bash || {
        echo "Не удалось установить PostgreSQL автоматически"
        echo "Выполните вручную: sudo bash install-postgres.sh"
    }
else
    echo "✓ PostgreSQL установлен"
fi

# 2. Создаем .env файл
echo ""
echo "2. Создание .env файла..."
cd /var/www/gogomarket-api
if [ ! -f ".env" ]; then
    echo "Создаем .env файл..."
    curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/create-env-on-server.sh | bash || {
        echo "Создаем .env вручную..."
        cat > .env << 'ENVEOF'
PORT=3001
DATABASE_URL=postgresql://gogomarket:gogomarket@localhost:5432/gogomarket
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=gogomarket
DB_PASSWORD=gogomarket
DB_NAME=gogomarket
JWT_SECRET=change-me-to-a-long-secret-at-least-32-characters
NODE_ENV=production
ENVEOF
    }
    echo "✓ .env файл создан"
else
    echo "✓ .env файл существует"
    # Проверяем, что DB_PASSWORD установлен
    if ! grep -qE "DB_PASSWORD=.*[^[:space:]]|DATABASE_URL=.*gogomarket.*gogomarket" .env; then
        echo "⚠ DB_PASSWORD не установлен правильно!"
        echo "Добавьте в .env:"
        echo "DB_PASSWORD=gogomarket"
        echo "или"
        echo "DATABASE_URL=postgresql://gogomarket:gogomarket@localhost:5432/gogomarket"
    fi
fi

# 3. Пересобираем API с исправлениями
echo ""
echo "3. Пересборка API с исправлениями..."
cd /var/www
if [ -d "gogotest" ]; then
    cd gogotest
    git pull origin main || echo "Не удалось обновить (продолжаем)"
else
    git clone https://github.com/buranovt2025-jpg/gogotest.git
    cd gogotest
fi

cd server
npm install
npm run build

if [ ! -f "dist/main.js" ]; then
    echo "Ошибка: сборка не удалась!"
    exit 1
fi

# 4. Копируем собранные файлы
echo ""
echo "4. Копирование файлов..."
mkdir -p /var/www/gogomarket-api/dist
cp -r dist/* /var/www/gogomarket-api/dist/
cp package.json package-lock.json /var/www/gogomarket-api/

# 5. Устанавливаем зависимости
echo ""
echo "5. Установка зависимостей..."
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

# 6. Перезапускаем API
echo ""
echo "6. Перезапуск API..."
pm2 stop gogomarket-api 2>/dev/null || true
pm2 delete gogomarket-api 2>/dev/null || true
pm2 start dist/main.js --name gogomarket-api
pm2 save

# 7. Ждем запуска
echo ""
echo "7. Ожидание запуска API..."
sleep 15

# 8. Проверка
echo ""
echo "8. Проверка:"
if ! pm2 describe gogomarket-api >/dev/null 2>&1; then
    echo "Ошибка: API не запущен!"
    pm2 logs gogomarket-api --lines 50 --nostream
    exit 1
fi

if ! ss -tlnp | grep -q ':3001'; then
    echo "Ошибка: Порт 3001 не слушается!"
    pm2 logs gogomarket-api --lines 50 --nostream
    exit 1
fi

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

echo ""
echo "=== Готово! API работает ==="
