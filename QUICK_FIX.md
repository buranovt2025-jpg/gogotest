# Быстрое применение исправлений

## Вариант 1: Выполнить скрипт на сервере

```bash
# Загрузить и выполнить скрипт одной командой
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/apply-all-fixes.sh | bash
```

## Вариант 2: Скопировать и выполнить вручную

Выполните на сервере:

```bash
cd /var/www/gogomarket-api
rm -rf node_modules package-lock.json
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
pm2 restart gogomarket-api

# Применить конфигурацию Nginx
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~ ^/(manifest\.json|robots\.txt|sitemap\.xml)$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    location ~ ^/api/(.*)$ {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }
        set $api_path $1;
        proxy_pass http://127.0.0.1:3001/$api_path;
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

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

## Проверка

```bash
curl http://134.122.77.41/api/health
```

Откройте http://134.122.77.41/login и войдите с:
- Email: `admin@gogomarket.local`
- Пароль: `GogoAdmin123`
