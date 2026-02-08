# Примеры для мониторинга GogoMarket API

- **prometheus-scrape.example.yml** — фрагмент `scrape_configs` для Prometheus (job `gogomarket`, target API).
- **prometheus-alerts.example.yml** — пример правил алертов: недоступность API (GogoMarketDown), высокий RPS (GogoMarketHighRequestRate). Подключить в `prometheus.yml` как `rule_files`, при необходимости изменить `job` под свой scrape job.
- **alertmanager.example.yml** — пример конфигурации Alertmanager: маршрутизация по severity, receiver `default`. В комментариях — шаблоны для Slack, email, webhook; без настроенных каналов алерты только группируются.
- **grafana-dashboard.example.json** — дашборд для Grafana: аптайм, общее число запросов, RPS (rate за 5 мин), график и таблица запросов по маршрутам (method, path). Импорт: Dashboards → Import → загрузить JSON. Убедитесь, что источник данных Prometheus имеет uid `prometheus` (или замените в JSON).
