import { Outlet, Link, useLocation } from 'react-router-dom'
import CartBadge from './CartBadge'

export default function Layout() {
  const path = useLocation().pathname
  return (
    <>
      <a href="#main" className="skip-link">Перейти к контенту</a>
      <nav className="nav">
        <Link to="/" className="brand">GogoMarket</Link>
        <span style={{ fontWeight: path.startsWith('/buyer') ? 600 : 400 }}><CartBadge /></span>
        <Link to="/seller" style={{ fontWeight: path === '/seller' ? 600 : 400 }}>Продавец</Link>
        <Link to="/courier" style={{ fontWeight: path === '/courier' ? 600 : 400 }}>Курьер</Link>
        <Link to="/admin" style={{ fontWeight: path === '/admin' ? 600 : 400 }}>Админ</Link>
      </nav>
      <main id="main" className="layout-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
        GogoMarket — маркетплейс. Деплой на Digital Ocean.
      </footer>
    </>
  )
}
