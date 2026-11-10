
import { Suspense } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";

import Feed from "./pages/Feed";
import Metricas from "./pages/metricas";
import Home from "./pages/home";
import Perfil from "./pages/perfil";
import Catalogo from "./pages/catalogo";
import Livro from "./pages/livro";
import Login from "./pages/login";
import { obterUsuario } from "./services/listasService";
import { FOTO_PADRAO, ouvirPerfilAtualizado } from "./services/perfilService";
import { obterTema, salvarTema } from "./services/temaService";

import "./App.css";
import "./tema.css";

function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const [logado] = useState(
    !!localStorage.getItem("token")
  );
  const [tema, setTema] = useState(obterTema);

  // Foto do usuário na barra de navegação (usa a foto padrão enquanto carrega ou se falhar).
  const [fotoDoUsuario, setFotoDoUsuario] = useState("");

  useEffect(() => {
    const sincronizar = () => setTema(obterTema());
    window.addEventListener("tema-atualizado", sincronizar);
    return () => window.removeEventListener("tema-atualizado", sincronizar);
  }, []);

  useEffect(() => {
    if (!logado) return;
    obterUsuario()
      .then((usuario) => setFotoDoUsuario(usuario.perfil?.foto ?? ""))
      .catch(() => setFotoDoUsuario(""));

    // Quando o perfil é editado, a foto daqui muda junto.
    return ouvirPerfilAtualizado(setFotoDoUsuario);
  }, [logado]);
  return (
    <>
      <nav className="navbar" aria-label="Navegação principal">
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

        <button
          type="button"
          className="theme-toggle"
          aria-pressed={tema === "escuro"}
          aria-label={tema === "escuro" ? "Ativar modo claro" : "Ativar modo escuro"}
          onClick={() => salvarTema(tema === "escuro" ? "claro" : "escuro")}
        >
          <span aria-hidden="true">{tema === "escuro" ? "☀" : "☾"}</span>
          <span className="theme-toggle__label">{tema === "escuro" ? "Claro" : "Escuro"}</span>
        </button>

        {logado ? (
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              isActive ? "perfil active" : "perfil"
            }
            aria-label="Meu perfil"
          >
            <img
              src={fotoDoUsuario || FOTO_PADRAO}
              alt="Foto de perfil"
              onError={(e) => {
                if (e.currentTarget.src !== FOTO_PADRAO) e.currentTarget.src = FOTO_PADRAO;
              }}
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
