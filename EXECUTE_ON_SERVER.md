# Выполните на сервере

## Одна команда для исправления всего:

```bash
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/fix-all.sh | bash
```

Или быстрый вариант (только API):

```bash
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/quick-fix.sh | bash
```

После выполнения проверьте:
```bash
curl http://134.122.77.41/api/health
```

И откройте http://134.122.77.41/login
