#!/bin/bash
# Скрипт для исправления конфигурации Nginx для API

set -e

echo "Применение исправленной конфигурации Nginx..."

sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_CONFIG'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API прокси - ДОЛЖЕН БЫТЬ ПЕРВЫМ после статики
    location /api/ {
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
        
        # Проксируем на API, убирая /api из пути
        proxy_pass http://127.0.0.1:3001/;
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

    # Кэширование статических файлов
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Статические файлы из public
    location ~ ^/(manifest\.json|robots\.txt|sitemap\.xml)$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    # SPA fallback - должен быть последним
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONFIG

# Проверяем конфигурацию
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✓ Nginx перезагружен успешно"
    
    # Проверка
    echo ""
    echo "Проверка API через Nginx:"
    curl -s http://134.122.77.41/api/health | head -3 || echo "Ошибка подключения"
else
    echo "✗ Ошибка в конфигурации Nginx!"
    exit 1
fi
