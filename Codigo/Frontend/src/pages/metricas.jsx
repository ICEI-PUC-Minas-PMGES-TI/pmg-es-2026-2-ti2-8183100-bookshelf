import "./metricas.css";
import { useEffect, useState } from "react";
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import BookMetricas from "../components/BookMetricas";
import {items} from "../mocks/JsonLivros.json";

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
	console.log(items);
	
	return (
		<main className="metricas-main">
			<section className="metricas-layout">
				<aside className="estatisticas">
					<h2>Estatísticas:</h2>

					<div className="estatistica-item">
						<label>Horas lidas:</label>
						<div className="estatistica-valor">
							{Math.floor((usuario?.minLidos || 0) / 60)}h {(usuario?.minLidos || 0) % 60}min
						</div>
					</div>

					<div className="estatistica-item">
						<label>Livros lidos:</label>
						<div className="estatistica-valor">{usuario?.livrosLidos.length || 0}</div>
					</div>

					<div className="estatistica-item">
						<label>Páginas lidas:</label>
						<div className="estatistica-valor">{usuario?.pagsLidas || 0}</div>
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
							<BookMetricas 
								titulo="O Pequeno Príncipe"
								imagem="https://m.media-amazon.com/images/I/61NHEYzP6kL._SY425_.jpg"
							/>
							<BookMetricas 
								titulo="O Pequeno Príncipe"
								imagem="https://m.media-amazon.com/images/I/61NHEYzP6kL._SY425_.jpg"
							/>
							<BookMetricas 
								titulo="O Pequeno Príncipe"
								imagem="https://m.media-amazon.com/images/I/61NHEYzP6kL._SY425_.jpg"
							/>
						</div>
					</section>
				</section>

				<section className="favoritos-card">
					<h3>Favoritos:</h3>

					<div className="favoritos-lista">
						<BookMetricas 
							titulo="O Pequeno Príncipe"
							imagem="https://m.media-amazon.com/images/I/61NHEYzP6kL._SY425_.jpg"
						/>
						<BookMetricas 
							titulo="O Pequeno Príncipe"
							imagem="https://m.media-amazon.com/images/I/61NHEYzP6kL._SY425_.jpg"
						/>
						<BookMetricas 
							titulo="O Pequeno Príncipe"
							imagem="https://m.media-amazon.com/images/I/61NHEYzP6kL._SY425_.jpg"
						/>
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