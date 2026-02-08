#!/bin/bash
# Однократная настройка сервера Ubuntu (Digital Ocean Droplet)
# Запустить на сервере: bash server-setup.sh (или скопировать команды)

set -e
apt-get update
apt-get install -y nginx
mkdir -p /var/www/html
chown -R www-data:www-data /var/www/html
systemctl enable nginx
systemctl start nginx
echo "Nginx установлен. Сайт будет раздаваться из /var/www/html"
