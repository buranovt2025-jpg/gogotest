# Диагностика проблем с API

## Быстрая диагностика

Выполните на сервере:

```bash
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/diagnose.sh | bash
```

Этот скрипт покажет:
- Статус PM2 и процесса API
- Слушается ли порт 3001
- Последние логи API
- Работает ли health endpoint
- Существуют ли необходимые файлы

## Применение исправлений

Если API не работает, выполните:

```bash
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/auto-fix.sh | bash
```

Этот скрипт:
1. Обновит репозиторий
2. Пересоберет API с исправлениями
3. Переустановит зависимости
4. Перезапустит API через PM2
5. Проверит работоспособность

## Ручная проверка

Если скрипты не помогают, проверьте вручную:

```bash
# Проверка PM2
pm2 status
pm2 logs gogomarket-api --lines 50

# Проверка порта
ss -tlnp | grep 3001

# Проверка файлов
ls -la /var/www/gogomarket-api/dist/
ls -la /var/www/gogomarket-api/node_modules/ | head -20

# Проверка health endpoint
curl http://localhost:3001/health
curl http://134.122.77.41/api/health
```

## Частые проблемы

1. **API не запускается** - проверьте логи PM2: `pm2 logs gogomarket-api`
2. **Порт не слушается** - проверьте, запущен ли процесс: `pm2 status`
3. **502 Bad Gateway** - API не отвечает, проверьте логи и перезапустите: `pm2 restart gogomarket-api`
