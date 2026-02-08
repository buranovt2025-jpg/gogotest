# Соответствие кода отчёту ТЗ (GOGOMARKET)

Документ фиксирует, как текущий репозиторий приведён в соответствие с отчётом по проекту (SELLER_FULL/SELLER_SIMPLE, Gemini, рилсы/истории, чат).

---

## 1. Архитектурное разделение SELLER_FULL vs SELLER_SIMPLE

**Реализовано в коде:**

- **`src/types.ts`** — перечисление `UserRole` (BUYER, SELLER_FULL, SELLER_SIMPLE, COURIER, ADMIN), типы `SellerType` ('FULL' | 'SIMPLE'), `SimpleCategory` ('auto' | 'realty' | 'services').

- **Seller (SellerView-логика в `src/pages/Seller.tsx`):**
  - `role` (UserRole.SELLER_FULL | SELLER_SIMPLE), **`isSimple = role === UserRole.SELLER_SIMPLE`**.
  - **Если `isSimple === true`:** интерфейс «Объявления», выбор категории (авто, недвижимость, услуги), в форме — поля «Пробег (км)» для авто, «Площадь (м²)» для недвижимости.
  - **Если `role === UserRole.SELLER_FULL`:** интерфейс «Инвентарь» (интернет-магазин), форма без категории/пробега/площади, кнопка «Сгенерировать описание (ИИ)».

- **Buyer (`src/pages/Buyer.tsx`, `src/pages/BuyerProduct.tsx`):**
  - Логика кнопки по **`p.sellerType`**:
    - **`p.sellerType === 'FULL'`** → кнопка «В корзину», вызов `addToCart(p.id)`.
    - **`p.sellerType === 'SIMPLE'`** → кнопка «Связаться», переход в чат (`/chat?product=...`).
  - В карточке товара для продавца SIMPLE отображается бейдж **«Dealer»**.

**Данные:**

- `src/data/catalog.ts` — у каждого товара поле `sellerType: 'FULL' | 'SIMPLE'`.
- `src/data/sellerProducts.ts` — у товара продавца опционально `sellerType`, `category`, `mileage`, `area`.

---

## 2. Интеграция ИИ Gemini

**Файлы и функции:**

- **`src/services/geminiService.ts`:**
  - **Генератор описаний:** `generateAIDescription(productName, category?)` — используется в Seller при «Сгенерировать описание (ИИ)» (по сути вызов gemini-pro).
  - **GOGO AI Помощник:** `getAISupport(userMessage)` — ответы на вопросы о платформе (Gemini), используется в чате.

- **`src/lib/gemini.ts`** — низкоуровневый вызов API (generateContent), вызывается из `geminiService`.

- **Использование:**
  - **SellerView (Seller.tsx):** кнопка «Сгенерировать описание (ИИ)» вызывает `generateAIDescription` (с категорией для SIMPLE).
  - **ChatView (ChatView.tsx):** отправка сообщения пользователя вызывает `getAISupport`, ответ выводится в чат.

---

## 3. Социальный e-commerce (рилсы и истории)

**Реализовано:**

- **Рилсы** — в **Buyer.tsx** вкладка «Рилсы»:
  - Вертикальный список карточек (имитация Snap-скролла).
  - Каждый рилс привязан к товару `p` (productId): название, цена, кнопки «Купить» / «Связаться» и «Подробнее» в зависимости от `p.sellerType`.

- **Истории** — в **Buyer.tsx** горизонтальная лента в шапке:
  - Круги по товарам (первые 4 из каталога), по клику открывается блок «История» с названием товара и ссылкой «Перейти» на страницу товара (`/buyer/product/:id`).
  - Связь: контент истории привязан к `productId`.

**Ограничения (по ТЗ «осталось»):** реальная загрузка видео/фото (S3), обработка видео (FFmpeg) не реализованы — только UI-привязка к товарам.

---

## 4. Чат и переход «Связаться»

- **`src/pages/ChatView.tsx`** — экран чата с GOGO AI Помощником (`getAISupport`).
- Переход «Связаться» из каталога/карточки товара ведёт на `/chat?product=:id`; в чате отображается контекст «По товару: …».

---

## 5. Текущий статус и что осталось по ТЗ

**Сделано в репозитории:**

- Разделение SELLER_FULL / SELLER_SIMPLE в типах и в UI (Seller, Buyer, BuyerProduct).
- Интеграция Gemini: генератор описаний + GOGO AI Помощник в чате.
- Рилсы и истории (UI, привязка к productId).
- Чат (ChatView) с вызовом getAISupport.

**Осталось (согласно отчёту):**

- **Backend:** NestJS API готов (products, orders, disputes), in-memory; PostgreSQL — опционально (docker-compose в server/).
- **Real-time:** WebSocket (Socket.IO) добавлен в server (ChatGateway: join, message); фронт — заготовка в api/ws.ts.
- **Media:** загрузка и хранение (S3), обработка видео (FFmpeg).
- **Maps:** API карт (Яндекс / 2GIS) для адреса и трекинга.
- **Языки:** переключатель RU/UZ/EN реализован (LocaleContext, translations.ts, useTranslation), все экраны переведены: Home, Layout, Buyer, Seller, Courier, Admin, BuyerProduct, ChatView.

Код приведён в соответствие с описанной в отчёте структурой ТЗ и готов к этапу интеграции с бэкендом.
