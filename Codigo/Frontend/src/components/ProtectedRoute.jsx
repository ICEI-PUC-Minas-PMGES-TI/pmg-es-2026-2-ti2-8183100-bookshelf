import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { verificarToken } from "../services/appService";

function ProtectedRoute() {
  const [autorizado, setAutorizado] = useState(null);

  useEffect(() => {
    async function verificar() {
      try {
        const valido = await verificarToken();

        if (!valido) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          window.location.href = "/login";
        }

        setAutorizado(valido);
      } catch (erro) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setAutorizado(false);
      }
    }

    verificar();
  }, []);

  if (autorizado === null) {
    return <p>Verificando autenticação...</p>;
  }

  return autorizado ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;