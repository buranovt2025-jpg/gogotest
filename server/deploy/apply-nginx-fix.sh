#!/bin/bash
# Скрипт для применения исправлений Nginx

set -e

echo "Применение конфигурации Nginx..."
sudo cp /tmp/nginx-default-with-api.conf /etc/nginx/sites-available/default

echo "Проверка конфигурации Nginx..."
sudo nginx -t

echo "Перезагрузка Nginx..."
sudo systemctl reload nginx

echo "Проверка статуса Nginx..."
sudo systemctl status nginx --no-pager -l

echo "Готово! Nginx перезагружен."
