import "./metricas.css";
import { useEffect, useState } from "react";
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

async function logUser(userId) {
    try {
        const response = await fetch(`http://localhost:3001/api/usuarios/${userId}`, {
            method: "GET",
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

export default function Metricas() {
	const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const data = await logUser(1);
                setUsuario(data);
            } catch (error) {
				console.error(error);
            }
        }
		
        carregarUsuario();
    }, []);
	
	return (
		<main className="metricas-main">
			<section className="metricas-layout">
				<aside className="estatisticas">
					<h2>Estatísticas:</h2>

					<div className="estatistica-item">
						<label>Horas lidas:</label>
						<div className="estatistica-valor">Value</div>
					</div>

					<div className="estatistica-item">
						<label>Livros lidos:</label>
						<div className="estatistica-valor">Value</div>
					</div>

					<div className="estatistica-item">
						<label>Páginas lidas:</label>
						<div className="estatistica-valor">Value</div>
					</div>
				</aside>

				<section className="calendario-card">
					<Calendar />
				</section>

				<section className="metricas-direita">
					<div className="streak-card">
						<h2>Streak Máximo:</h2>
						<strong>{usuario?.sequencia || 0}</strong>
						<span className="streak-fogo" role="img" aria-label="Fogo">
							🔥
						</span>
					</div>

					<section className="leituras-card">
						<h2>Leituras atuais:</h2>
						<div className="leituras-lista">

						</div>
					</section>
				</section>

				<section className="favoritos-card">
					<h3>Favoritos:</h3>

					<div className="favoritos-lista">

					</div>
				</section>

				<div className="metricas-acoes">
					<button type="button" className="botao-circulo">
						CIRCULO +
					</button>
				</div>
			</section>
		</main>
	);
}