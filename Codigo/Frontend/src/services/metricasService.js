import API_URL from "../services/api";

export async function logUser(userId) {
	try {
		const token = localStorage.getItem("token");

		const response = await fetch(`${API_URL}/api/usuarios/${userId}`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error("Erro ao buscar usuário");
		}

		const data = await response.json();

		return data;
	} catch (error) {
		console.error("Erro ao buscar dados do usuário:", error);
		throw error;
	}
}

export async function buscarMetricas(userId) {
	try {
		const token = localStorage.getItem("token");

		const response = await fetch(`${API_URL}/api/metricas/usuario/${userId}`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error("Erro ao buscar métricas");
		}

		const data = await response.json();

		return data;
	} catch (error) {
		console.error("Erro ao buscar métricas:", error);
		throw error;
	}
}