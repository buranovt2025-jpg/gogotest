#!/bin/bash
# Подсказка: как включить SPA на сервере (чтобы /buyer, /seller открывались после F5).
# На сервере отредактируйте конфиг Nginx:
#   sudo nano /etc/nginx/sites-available/default
# В блоке "location / { }" внутри добавьте строку (после root ...;):
#   try_files $uri $uri/ /index.html;
# Затем: sudo nginx -t && sudo systemctl reload nginx

echo "На сервере в /etc/nginx/sites-available/default в блок location / добавьте:"
echo "  try_files \$uri \$uri/ /index.html;"
echo "Затем: nginx -t && systemctl reload nginx"
