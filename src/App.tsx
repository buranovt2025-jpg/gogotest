import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Buyer from './pages/Buyer'
import Seller from './pages/Seller'
import Courier from './pages/Courier'
import Admin from './pages/Admin'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buyer" element={<Buyer />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/courier" element={<Courier />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
