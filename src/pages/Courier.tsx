import PageTitle from '../components/PageTitle'

const DELIVERIES = [
  { id: '1', address: 'ул. Примерная, 10', status: 'В пути', orderId: '#1001' },
  { id: '2', address: 'пр. Тестовый, 5', status: 'Ожидает', orderId: '#1002' },
  { id: '3', address: 'ул. Демо, 3', status: 'Доставлен', orderId: '#1003' },
]

export default function Courier() {
  return (
    <>
      <PageTitle title="Курьер" />
      <h1 style={{ marginTop: 0 }}>Курьер</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Список доставок и статусы.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {DELIVERIES.map((d) => (
          <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{d.orderId}</strong> — {d.address}
            </div>
            <span
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: 6,
                fontSize: '0.85rem',
                background: d.status === 'Доставлен' ? '#dcfce7' : d.status === 'В пути' ? '#fef3c7' : '#e2e8f0',
                color: '#334155',
              }}
            >
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
