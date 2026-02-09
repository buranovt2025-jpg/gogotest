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

# Запускаем API и проверяем статус
echo "Запуск API через PM2..."
pm2 start dist/main.js --name gogomarket-api || {
    echo "Ошибка при запуске API через PM2!"
    pm2 logs gogomarket-api --lines 50 --nostream || true
    exit 1
}
pm2 save

# Ждем запуска и проверяем статус
echo "Ожидание запуска API..."
sleep 8

# Проверяем статус PM2
echo ""
echo "Статус PM2:"
pm2 status gogomarket-api || {
    echo "API не запущен в PM2!"
    pm2 logs gogomarket-api --lines 50 --nostream || true
    exit 1
}

# Проверяем логи на ошибки
echo ""
echo "Последние логи API:"
pm2 logs gogomarket-api --lines 20 --nostream || true

# Проверка порта
echo ""
echo "Проверка порта 3001:"
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
else
    echo "✗ Порт 3001 не слушается!"
    echo "Логи API:"
    pm2 logs gogomarket-api --lines 50 --nostream || true
    exit 1
fi

# Проверка health endpoint
echo ""
echo "Проверка health endpoint:"
HEALTH=$(curl -s --max-time 5 http://localhost:3001/health || echo "ERROR")
if [[ "$HEALTH" == *"ok"* ]] || [[ "$HEALTH" == *"GogoMarket"* ]] || [[ "$HEALTH" == *"status"* ]]; then
    echo "✓ API работает"
    echo "$HEALTH" | head -5
else
    echo "✗ API не отвечает правильно"
    echo "Ответ: $HEALTH"
    echo ""
    echo "Логи API:"
    pm2 logs gogomarket-api --lines 50 --nostream || true
    exit 1
fi

echo ""
echo "=== Готово! API успешно запущен ==="
