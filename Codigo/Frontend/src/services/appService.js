import API_URL from "../services/api";

export async function verificarToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        return false;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/usuarios`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            return false;
        }

        return true;

    } catch (erro) {
        console.error("Erro ao verificar token:", erro);
        return false;
    }
}