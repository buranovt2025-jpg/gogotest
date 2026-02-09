#!/bin/bash
# Полное исправление всех проблем на сервере

set -e

echo "=== Полное исправление GogoMarket ==="

# 1. Клонируем/обновляем репозиторий
echo ""
echo "1. Подготовка исходников..."
cd /var/www

if [ -d "gogotest" ]; then
    echo "Обновление репозитория..."
    cd gogotest
    git pull origin main || echo "Не удалось обновить (продолжаем с текущей версией)"
else
    echo "Клонирование репозитория..."
    git clone https://github.com/buranovt2025-jpg/gogotest.git
    cd gogotest
fi

# 2. Пересобираем API
echo ""
echo "2. Пересборка API..."
cd server
npm install
npm run build

if [ ! -f "dist/main.js" ]; then
    echo "Ошибка: сборка не удалась!"
    exit 1
fi

# 3. Копируем собранные файлы
echo ""
echo "3. Копирование файлов..."
mkdir -p /var/www/gogomarket-api/dist
cp -r dist/* /var/www/gogomarket-api/dist/
cp package.json package-lock.json /var/www/gogomarket-api/

# 4. Устанавливаем зависимости и перезапускаем API
echo ""
echo "4. Установка зависимостей и перезапуск API..."
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2
fi

pm2 stop gogomarket-api 2>/dev/null || true
pm2 delete gogomarket-api 2>/dev/null || true
pm2 start dist/main.js --name gogomarket-api
pm2 save

# 5. Ждем запуска
sleep 5

# 6. Проверяем
echo ""
echo "5. Проверка..."
if ss -tlnp | grep -q ':3001'; then
    echo "✓ Порт 3001 слушается"
    HEALTH=$(curl -s http://localhost:3001/health || echo "ERROR")
    if [[ "$HEALTH" == *"ok"* ]] || [[ "$HEALTH" == *"GogoMarket"* ]]; then
        echo "✓ API работает"
        echo "$HEALTH" | head -3
    else
        echo "✗ API не отвечает правильно"
        pm2 logs gogomarket-api --lines 20 --nostream
    fi
else
    echo "✗ Порт 3001 не слушается!"
    pm2 logs gogomarket-api --lines 30 --nostream
    exit 1
fi

# 7. Применяем конфигурацию Nginx
echo ""
echo "6. Применение конфигурации Nginx..."
cd /var/www/gogotest
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /api/ {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~ ^/(manifest\.json|robots\.txt|sitemap\.xml)$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_EOF

sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx перезагружен"

# 8. Финальная проверка
echo ""
echo "7. Финальная проверка..."
NGINX_HEALTH=$(curl -s http://134.122.77.41/api/health || echo "ERROR")
if [[ "$NGINX_HEALTH" == *"ok"* ]] || [[ "$NGINX_HEALTH" == *"GogoMarket"* ]]; then
    echo "✓ API работает через Nginx"
    echo "$NGINX_HEALTH" | head -3
else
    echo "✗ API не работает через Nginx"
    echo "Ответ: $NGINX_HEALTH"
fi

echo ""
echo "=== Готово! ==="
echo ""
echo "Проверьте вход на: http://134.122.77.41/login"
echo "Тестовые данные: admin@gogomarket.local / GogoAdmin123"
