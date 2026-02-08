# Развёртывание на Digital Ocean

## Репозиторий
**GitHub:** https://github.com/buranovt2025-jpg/gogotest

## Сервер (Droplet)
- **IPv4:** 134.122.77.41
- **Регион:** FRA1 (Frankfurt)
- **ОС:** Ubuntu 24.04 LTS

Пароль root храните только у себя (в менеджере паролей). В репозиторий и в файлы проекта пароль не добавлять.

---

## Вариант 1: Загрузка dist на сервер

1. Локально: `npm run build` (папка `dist/` готова).
2. Загрузить **содержимое** `dist/` в `/var/www/html` на сервере:

   ```bash
   scp -r dist/* root@134.122.77.41:/var/www/html/
   ```

   При запросе введите пароль root.

3. На сервере должен быть установлен Nginx (или Apache), чтобы раздавать файлы из `/var/www/html`.

---

## Вариант 2: Клонировать репо на сервер и собирать там

На сервере:

```bash
ssh root@134.122.77.41
apt update && apt install -y nodejs npm nginx
git clone https://github.com/buranovt2025-jpg/gogotest.git /var/www/gogotest
cd /var/www/gogotest
npm install
npm run build
cp -r dist/* /var/www/html/
```

Дальше настроить Nginx на раздачу из `/var/www/html` (или из папки с `dist`).

---

## После деплоя

- Сайт будет доступен по адресу: `http://134.122.77.41`
- Для HTTPS: получить сертификат (например, Let's Encrypt) и настроить Nginx.

Конфиги Nginx и скрипты деплоя можно добавить в репозиторий по запросу.
