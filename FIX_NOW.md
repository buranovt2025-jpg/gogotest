# Быстрое исправление API

## Выполните на сервере:

```bash
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/fix-and-start.sh | bash
```

Этот скрипт:
1. Остановит старый процесс API
2. Проверит наличие файлов
3. Установит зависимости если нужно
4. Запустит API через PM2
5. Проверит работоспособность

## Или через диагностику:

```bash
curl -sSL https://raw.githubusercontent.com/buranovt2025-jpg/gogotest/main/server/deploy/diagnose.sh | bash
```

Это покажет текущее состояние API и поможет понять проблему.
