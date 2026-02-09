#!/bin/bash
# Полное исправление: пересборка API с исправлениями БД и перезапуск

set -e

echo "=== Полное исправление API с исправлениями БД ==="

# Останавливаем API
pm2 stop gogomarket-api 2>/dev/null || true
pm2 delete gogomarket-api 2>/dev/null || true

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

# Пересобираем API с исправлениями
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

# Проверяем и создаем .env файл
echo "Проверка переменных окружения БД..."
cd /var/www/gogomarket-api

if [ ! -f ".env" ]; then
    echo "Создаем файл .env..."
    # Проверяем переменные окружения системы или используем значения по умолчанию
    cat > .env << 'ENVEOF'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=gogomarket

# JWT
JWT_SECRET=default-secret-change-in-production

# Node
NODE_ENV=production
PORT=3001
ENVEOF
    echo "✓ Создан файл .env с значениями по умолчанию"
    echo "⚠ ВНИМАНИЕ: Проверьте и установите правильные значения DB_PASSWORD!"
else
    echo "✓ Файл .env существует"
    # Проверяем, что DB_PASSWORD установлен
    if ! grep -q "DB_PASSWORD=.*[^[:space:]]" .env; then
        echo "⚠ DB_PASSWORD не установлен в .env файле!"
        echo "Добавьте строку: DB_PASSWORD=ваш_пароль"
    fi
fi

# Устанавливаем зависимости
echo "Установка зависимостей..."
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

# Запускаем API
echo "Запуск API..."
pm2 start dist/main.js --name gogomarket-api
pm2 save

# Ждем запуска
echo "Ожидание запуска API..."
sleep 15

# Проверяем статус
if ! pm2 describe gogomarket-api >/dev/null 2>&1; then
    echo "Ошибка: API не запущен!"
    pm2 logs gogomarket-api --lines 50 --nostream
    exit 1
fi

# Проверяем порт
if ! ss -tlnp | grep -q ':3001'; then
    echo "Ошибка: Порт 3001 не слушается!"
    echo "Логи API:"
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
    echo ""
    echo "Логи API:"
    pm2 logs gogomarket-api --lines 50 --nostream
    exit 1
fi

echo ""
echo "=== Готово! ==="
