import PageTitle from '../components/PageTitle'

export default function Admin() {
  return (
    <>
      <PageTitle title="Админ" />
      <h1 style={{ marginTop: 0 }}>Админ</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>Управление пользователями и настройками.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <strong>Пользователи</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Список и роли</p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>
            Открыть
          </button>
        </div>
        <div className="card">
          <strong>Модерация</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Товары и отзывы</p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>
            Открыть
          </button>
        </div>
        <div className="card">
          <strong>Настройки</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>API, домен, уведомления</p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled>
            Открыть
          </button>
        </div>
      </div>
    </>
  )
}
