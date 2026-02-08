import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Buyer from './pages/Buyer'
import Seller from './pages/Seller'
import Courier from './pages/Courier'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buyer" element={<Buyer />} />
        <Route path="/seller" element={<Seller />} />
        <Route path="/courier" element={<Courier />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
