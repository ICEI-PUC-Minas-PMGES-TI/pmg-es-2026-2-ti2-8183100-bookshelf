import Feed from "./pages/Feed";
import Metricas from "./pages/metricas";
import Home from "./pages/home";
import Perfil from "./pages/perfil";
import Catalogo from "./pages/catalogo";
import "./App.css";
import { Suspense } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Logo" />
        </Link>

        <div className="nav-links">
          <Link to="/feed">Feed</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/metricas">Métricas</Link>
        </div>

        <Link to="/perfil" className="perfil">
          <img
            src="https://www.gravatar.com/avatar/?d=mp&s=100"
            alt="Foto de perfil"
          />
        </Link>
      </nav>

      <Suspense fallback={<p>Carregando página...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/metricas" element={<Metricas />} />
          <Route path="/catalogo" element={<Catalogo />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App;