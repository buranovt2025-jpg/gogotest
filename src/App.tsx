import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LocaleProvider } from './context/LocaleContext'
import { CatalogProvider } from './context/CatalogContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Buyer from './pages/Buyer'
import BuyerProduct from './pages/BuyerProduct'
import ChatView from './pages/ChatView'
import Seller from './pages/Seller'
import Courier from './pages/Courier'
import Admin from './pages/Admin'
import Login from './pages/Login'

export default function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ToastProvider>
          <AuthProvider>
            <CatalogProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/buyer" element={<Buyer />} />
                    <Route path="/buyer/product/:id" element={<BuyerProduct />} />
                    <Route path="/chat" element={<ChatView />} />
                    <Route path="/seller" element={<Seller />} />
                    <Route path="/courier" element={<Courier />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/login" element={<Login />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </CatalogProvider>
          </AuthProvider>
        </ToastProvider>
      </LocaleProvider>
    </ErrorBoundary>
  )
}
