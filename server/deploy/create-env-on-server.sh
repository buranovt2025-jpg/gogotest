#!/bin/bash
# Запустить на сервере (или через: ssh root@IP 'bash -s' < create-env-on-server.sh)
set -e
mkdir -p /var/www/gogomarket-api
cat > /var/www/gogomarket-api/.env << 'ENVEOF'
PORT=3001
DATABASE_URL=postgresql://gogomarket:gogomarket@localhost:5432/gogomarket
JWT_SECRET=change-me-to-a-long-secret-at-least-32-characters
ENVEOF
echo "Created /var/www/gogomarket-api/.env"
echo "Edit if needed: nano /var/www/gogomarket-api/.env"
