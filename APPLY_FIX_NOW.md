# Применить исправления прямо сейчас

Выполните на сервере одну команду:

```bash
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/apply-fix-on-server.sh | bash
```

Или если исходников нет на сервере, склонируйте репозиторий и пересоберите:

```bash
cd /var/www
git clone https://github.com/buranovt2025-jpg/gogotest.git
cd gogotest/server
npm install
npm run build
cp -r dist/* /var/www/gogomarket-api/dist/
cd /var/www/gogomarket-api
pm2 restart gogomarket-api
```

После этого проверьте:
```bash
curl http://localhost:3001/health
curl http://134.122.77.41/api/health
```
