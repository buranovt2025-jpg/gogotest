import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'

const CART_KEY = 'gogomarket-cart'

function getCartCount(): number {
  try {
    const s = localStorage.getItem(CART_KEY)
    if (!s) return 0
    const cart: { qty: number }[] = JSON.parse(s)
    return cart.reduce((sum, c) => sum + c.qty, 0)
  } catch { return 0 }
}

export default function CartBadge() {
  const { t } = useTranslation()
  const [count, setCount] = useState(getCartCount)

  useEffect(() => {
    const update = () => setCount(getCartCount())
    window.addEventListener('storage', update)
    window.addEventListener('gogomarket-cart-update', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('gogomarket-cart-update', update)
    }
  }, [])

  if (count === 0) return <Link to="/buyer">{t('navBuyer')}</Link>
  return (
    <Link to="/buyer">
      {t('navBuyer')} <span style={{ background: '#475569', padding: '0.1rem 0.4rem', borderRadius: 10, fontSize: '0.75rem' }}>{count}</span>
    </Link>
  )
}
