import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { verificarToken } from "../services/appService";

function ProtectedRoute() {
  const [autorizado, setAutorizado] = useState(null);

  useEffect(() => {
    async function verificar() {
      try {
        const valido = await verificarToken();
        setAutorizado(valido);
      } catch (erro) {
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