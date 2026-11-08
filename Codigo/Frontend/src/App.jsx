
import { Suspense } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Feed from "./pages/Feed";
import Metricas from "./pages/metricas";
import Home from "./pages/home";
import Perfil from "./pages/perfil";
import Catalogo from "./pages/catalogo";
import Livro from "./pages/livro";
import Login from "./pages/login";

import "./App.css";

function App() {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo" aria-label="BookMark - Início">
          <img src="/logo.png" alt="BookMark" />
        </Link>

        <div className="nav-links">
          <NavLink
            to="/feed" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} > Feed
          </NavLink>

          <NavLink
            to="/catalogo" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} > Catálogo
          </NavLink>

          <NavLink
            to="/metricas" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} > Métricas
          </NavLink>
        </div>

        {localStorage.getItem("token") ? (
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              isActive ? "perfil active" : "perfil"
            }
            aria-label="Meu perfil"
          >
            <img
              src="https://www.gravatar.com/avatar/?d=mp&s=100"
              alt="Foto de perfil"
            />
          </NavLink>
        ) : (
          <NavLink to="/login" className="perfil-login">
            Entrar
          </NavLink>
        )}
      </nav>

      <Suspense fallback={<p>Carregando página...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/catalogo" element={<Catalogo />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/metricas" element={<Metricas />} />
            <Route path="/livro/:id" element={<Livro />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
