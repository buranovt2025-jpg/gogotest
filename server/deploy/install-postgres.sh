#!/bin/bash
# Установка PostgreSQL и создание БД для GogoMarket API. Запускать на сервере: sudo bash install-postgres.sh
set -e
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y postgresql postgresql-contrib

# слушать localhost (уже по умолчанию в Ubuntu)
systemctl enable postgresql
systemctl start postgresql

# пользователь и БД (совпадает с server/.env.example)
sudo -u postgres psql -c "CREATE USER gogomarket WITH PASSWORD 'gogomarket';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE gogomarket OWNER gogomarket;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gogomarket TO gogomarket;"

echo "PostgreSQL ready. DATABASE_URL=postgresql://gogomarket:gogomarket@localhost:5432/gogomarket"
echo "Restart API: pm2 restart gogomarket-api"
