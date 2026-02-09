#!/bin/bash
# Проверка и установка переменных окружения для БД

echo "=== Проверка переменных окружения БД ==="

cd /var/www/gogomarket-api

# Проверяем наличие .env файла
if [ -f ".env" ]; then
    echo "✓ Файл .env существует"
    echo "Содержимое (без паролей):"
    grep -v "PASSWORD\|SECRET" .env | head -10 || echo "Нет переменных окружения"
else
    echo "✗ Файл .env не найден"
    echo "Создаем базовый .env файл..."
    
    # Проверяем переменные окружения системы
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_USERNAME=${DB_USERNAME:-postgres}
    DB_PASSWORD=${DB_PASSWORD:-}
    DB_NAME=${DB_NAME:-gogomarket}
    
    cat > .env << EOF
# Database
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# JWT
JWT_SECRET=default-secret-change-in-production

# Node
NODE_ENV=production
PORT=3001
EOF
    echo "✓ Создан файл .env"
fi

# Проверяем переменные окружения
echo ""
echo "Проверка переменных окружения:"
echo "DB_HOST: ${DB_HOST:-не установлена}"
echo "DB_PORT: ${DB_PORT:-не установлена}"
echo "DB_USERNAME: ${DB_USERNAME:-не установлена}"
echo "DB_PASSWORD: ${DB_PASSWORD:+установлена (скрыта)}"
echo "DB_NAME: ${DB_NAME:-не установлена}"

echo ""
echo "=== Готово ==="
