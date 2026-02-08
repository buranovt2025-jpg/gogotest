# Ответы: споры, Order, админка, кнопка «В корзину» / «Связаться»

## 1. Какие поля добавлены в Order для логики диспутов (ТЗ 3.1 и 5)

Интерфейс **Order** описан в **`src/types.ts`** и используется в `src/data/orders.ts`. Для споров добавлены поля:

| Поле | Тип | Назначение |
|------|-----|------------|
| `disputeStatus` | `'open' \| 'resolved_buyer' \| 'resolved_seller' \| 'rejected'` | Статус спора |
| `disputeReason` | `'damage' \| 'courier_no_show' \| 'wrong_item' \| 'other'` | Причина (повреждение, курьер не приехал и т.д.) |
| `disputeComment` | `string \| null` | Текст от покупателя |
| `disputeOpenedAt` | `string \| null` (ISO) | Время открытия спора → отсчёт 48 ч |
| `disputeResolution` | `'refund_full' \| 'refund_partial' \| 'reject' \| null` | Решение админа |
| `disputeResolvedBy` | `string \| null` | Кто решил (id админа) |
| `disputeResolvedAt` | `string \| null` (ISO) | Когда решён |

Типы причин и решений объявлены в **`src/types.ts`**: `DisputeReason`, `DisputeStatus`, `DisputeResolution`.

---

## 2. Как изменён Admin: вкладка «Споры» (решение в течение 48 ч)

В **`src/pages/Admin.tsx`**:

- Добавлены вкладки: **Статистика**, **Пользователи**, **Споры**.
- На вкладке **Споры**:
  - Список заказов с открытым спором (`loadOrdersWithDisputes()`).
  - По каждому заказу: id, дата, состав, сумма, причина и комментарий спора.
  - Дедлайн 48 ч: отображаются «Осталось X ч» или «Дедлайн истёк» от `disputeOpenedAt`.
  - Кнопки решения: **Возврат полный**, **Возврат частичный**, **Отклонить спор** → вызов `resolveDispute(orderId, resolution, 'admin-1')`, обновление списка споров.

Фрагмент вкладки «Споры»:

```tsx
{activeTab === 'disputes' && (
  <>
    <h2 style={{ marginBottom: '0.75rem' }}>Споры (решить в течение 48 ч)</h2>
    {disputes.length === 0 ? (
      <p style={{ color: '#64748b' }}>Нет открытых споров.</p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {disputes.map((o) => {
          const hoursLeft = getHoursLeft(o.disputeOpenedAt)  // 48 - (now - opened) в часах
          const isOverdue = hoursLeft !== null && hoursLeft <= 0
          return (
            <div key={o.id} className="card" style={{ borderLeft: `4px solid ${isOverdue ? '#dc2626' : '#2563eb'}` }}>
              <div>
                <strong>{o.id}</strong> — {o.date} · {o.items}
                <p>Причина: {DISPUTE_REASON_LABEL[o.disputeReason]} — {o.disputeComment}</p>
                {o.disputeOpenedAt && (
                  <span>{isOverdue ? 'Дедлайн истёк' : `Осталось ${hoursLeft.toFixed(1)} ч`}</span>
                )}
              </div>
              <div>
                <button onClick={() => handleResolve(o.id, 'refund_full')}>Возврат полный</button>
                <button onClick={() => handleResolve(o.id, 'refund_partial')}>Возврат частичный</button>
                <button onClick={() => handleResolve(o.id, 'reject')}>Отклонить спор</button>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </>
)}
```

Добавлены функции в **`src/data/orders.ts`**: `openDispute(orderId, reason, comment)`, `resolveDispute(orderId, resolution, resolvedBy)`, `loadOrdersWithDisputes()`.

---

## 3. Почему «В корзину» заменяется на «Связаться». Условие в коде

Поведение задаётся **типом продавца** товара: **`p.sellerType`** (или `product.sellerType` на странице товара).

Условие в **`src/pages/Buyer.tsx`** (карточка в каталоге):

```tsx
{p.sellerType === 'FULL' ? (
  <button type="button" className="btn btn-primary" onClick={() => addToCart(p.id)}>
    В корзину
  </button>
) : (
  <Link to={`/chat?product=${p.id}`} className="btn btn-secondary">Связаться</Link>
)}
```

То есть:

- **`p.sellerType === 'FULL'`** → показывается кнопка **«В корзину»**, по нажатию вызывается **`addToCart(p.id)`**.
- Иначе (для объявлений, **`p.sellerType === 'SIMPLE'`**) → показывается ссылка **«Связаться»**, переход в чат **`/chat?product=${p.id}`**.

В **`src/pages/BuyerProduct.tsx`** та же логика:

```tsx
const isFull = product.sellerType === 'FULL'
// ...
{isFull ? (
  <>
    <button onClick={() => handleAdd(1)}>В корзину</button>
    <button onClick={() => handleAdd(2)}>+2 в корзину</button>
  </>
) : (
  <Link to={`/chat?product=${product.id}`} className="btn btn-primary">Связаться</Link>
)}
```

Тип продавца задаётся в каталоге (**`src/data/catalog.ts`**) полем **`sellerType: 'FULL' | 'SIMPLE'`** у каждого товара; у товаров продавца-объявлений в интерфейсе дополнительно показывается бейдж **«Dealer»**.
