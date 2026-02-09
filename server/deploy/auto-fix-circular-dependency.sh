#!/bin/bash
# Автоматическое исправление циклической зависимости на сервере
# Выполняется через GitHub Actions после деплоя

set -e

echo "=== Автоматическое исправление циклической зависимости ==="

cd /var/www/gogomarket-api

# Проверяем, есть ли собранный код
if [ ! -f "dist/main.js" ]; then
    echo "Ошибка: dist/main.js не найден!"
    exit 1
fi

# Проверяем, есть ли исходники для пересборки
if [ -d "src" ] && [ -f "src/main.ts" ]; then
    echo "Найдены исходники, применяем исправления..."
    
    # Скачиваем исправленные модули
    mkdir -p src/auth src/users
    curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/src/auth/auth.module.ts -o src/auth/auth.module.ts
    curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/src/users/users.module.ts -o src/users/users.module.ts
    
    # Пересобираем
    echo "Пересборка API..."
    npm run build
    
    # Перезапускаем
    pm2 stop gogomarket-api 2>/dev/null || true
    pm2 delete gogomarket-api 2>/dev/null || true
    pm2 start dist/main.js --name gogomarket-api
    pm2 save
    
    sleep 5
    
    # Проверяем
    if ss -tlnp | grep -q ':3001'; then
        echo "✓ API запущен успешно"
        curl -s http://localhost:3001/health | head -3
    else
        echo "✗ API не запустился"
        pm2 logs gogomarket-api --lines 20 --nostream
        exit 1
    fi
else
    echo "Исходники не найдены. Используем уже собранный код из деплоя."
    echo "Если проблема сохраняется, дождитесь следующего деплоя."
fi

echo "=== Готово ==="
