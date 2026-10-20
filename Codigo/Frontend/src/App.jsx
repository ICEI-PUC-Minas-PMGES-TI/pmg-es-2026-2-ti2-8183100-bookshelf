import Feed from "./pages/Feed";
import Metricas from "./pages/metricas";
import Home from "./pages/home";
import Perfil from "./pages/perfil";
import Catalogo from "./pages/catalogo";
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
      <nav>
        <Link to="/">Início</Link>
        <Link to="/feed">Feed</Link>
        <Link to="/metricas">Metricas</Link>
        <Link to="/perfil">Perfil</Link>
        <Link to="/catalogo">Metricas</Link>
      </nav>

      <Suspense fallback={<p>Carregando página...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/metricas" element={<Perfil />} />
          <Route path="/perfil" element={<Metricas />} />
          <Route path="/catalogo" element={<Catalogo />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App;