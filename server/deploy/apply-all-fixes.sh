#!/bin/bash
# Скрипт для применения всех исправлений на сервере

set -e

echo "=== Применение исправлений GogoMarket ==="

# 1. Исправить API
echo ""
echo "1. Исправление API..."
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Установка PM2..."
  npm install -g pm2
fi

if pm2 describe gogomarket-api >/dev/null 2>&1; then
  pm2 restart gogomarket-api --update-env
else
  pm2 start dist/main.js --name gogomarket-api
  pm2 save
fi

echo "✓ API перезапущен"

# 2. Применить конфигурацию Nginx
echo ""
echo "2. Применение конфигурации Nginx..."

NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_NEW_CONF="/tmp/nginx-default-with-api.conf"

# Создаем временный файл с новой конфигурацией
cat > "$NGINX_NEW_CONF" << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html;

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Кэширование статических файлов
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Статические файлы из public (manifest, robots, sitemap)
    location ~ ^/(manifest\.json|robots\.txt|sitemap\.xml)$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    # API прокси
    location ~ ^/api/(.*)$ {
        # Обработка OPTIONS запросов (CORS preflight)
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }
        
        # Проксируем на API, убирая /api из пути через переменную
        set $api_path $1;
        proxy_pass http://127.0.0.1:3001/$api_path;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # CORS headers для ответов
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }

    # SPA fallback - должен быть последним
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Копируем конфигурацию
sudo cp "$NGINX_NEW_CONF" "$NGINX_CONF"
rm -f "$NGINX_NEW_CONF"

# Проверяем и перезагружаем
if sudo nginx -t; then
  sudo systemctl reload nginx
  echo "✓ Nginx перезагружен"
else
  echo "✗ Ошибка в конфигурации Nginx!"
  exit 1
fi

# 3. Проверка
echo ""
echo "3. Проверка работы..."
echo ""
echo "Проверка API (локально):"
curl -s http://localhost:3001/health | head -1 || echo "API не отвечает на localhost:3001"

echo ""
echo "Проверка API (через Nginx):"
curl -s http://134.122.77.41/api/health | head -1 || echo "API не отвечает через Nginx"

echo ""
echo "Статус PM2:"
pm2 status gogomarket-api

echo ""
echo "=== Готово! ==="
echo ""
echo "Проверьте вход на: http://134.122.77.41/login"
echo "Тестовые данные:"
echo "  Email: admin@gogomarket.local"
echo "  Пароль: GogoAdmin123"
