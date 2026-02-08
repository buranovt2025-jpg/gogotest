import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const path = useLocation().pathname
  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">GogoMarket</Link>
        <Link to="/buyer" style={{ fontWeight: path === '/buyer' ? 600 : 400 }}>Покупатель</Link>
        <Link to="/seller" style={{ fontWeight: path === '/seller' ? 600 : 400 }}>Продавец</Link>
        <Link to="/courier" style={{ fontWeight: path === '/courier' ? 600 : 400 }}>Курьер</Link>
        <Link to="/admin" style={{ fontWeight: path === '/admin' ? 600 : 400 }}>Админ</Link>
      </nav>
      <main className="layout-main">
        <Outlet />
      </main>
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
        GogoMarket — маркетплейс. Деплой на Digital Ocean.
      </footer>
    </>
  )
}
