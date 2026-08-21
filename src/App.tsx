import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Artista from './pages/Artista'
import Obras from './pages/Obras'
import Galeria from './pages/Galeria'
import ObraDetail from './pages/ObraDetail'
import Exposicoes from './pages/Exposicoes'
import Tiradentes from './pages/Tiradentes'
import Cafe from "./pages/Cafe"
import Admin from './pages/Admin'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/artista" element={<Artista />} />
      <Route path="/obras" element={<Obras />} />
      <Route path="/galeria" element={<Galeria />} />
      <Route path="/obra/:slug" element={<ObraDetail />} />
      <Route path="/exposicoes" element={<Exposicoes />} />
      <Route path="/tiradentes" element={<Tiradentes />} />
      <Route path="/cafe" element={<Cafe />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
