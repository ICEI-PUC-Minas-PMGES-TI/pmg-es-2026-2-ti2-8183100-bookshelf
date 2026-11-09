import "./metricas.css";
import { useEffect, useState } from "react";
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import BookMetricas from "../components/BookMetricas";
import MetricasModal from "../components/MetricasModal";
import { buscarLivrosPorIds } from "../services/booksService";
import { logUser } from "../services/metricasService";


export default function Metricas() {
	async function carregarUsuario() {
		try {
			const data = await logUser(userLog.id);
			setUsuario(data);
			const ids = [...(data.livrosLendo ?? []), ...(data.livrosFav ?? [])];
			setLivros(await buscarLivrosPorIds(ids));
		} catch (error) {
			console.error(error);
		}
	}
	const [usuario, setUsuario] = useState(null);
	const [livros, setLivros] = useState([]);
	const userLog = JSON.parse(localStorage.getItem("usuario"));
	const [popUp, setPopUp] = useState(false);

	useEffect(() => {
		carregarUsuario();
	}, []);

	function livrosDa(lista) {
		return (usuario?.[lista] ?? [])
			.map((id) => livros.find((livro) => livro.id === id))
			.filter(Boolean);
	}

	const lendo = livrosDa("livrosLendo");
	const favoritos = livrosDa("livrosFav");
	const lerDepois = livrosDa("livrosLerDepois");

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
						<div className="estatistica-valor">{usuario?.livrosLidos?.length || 0}</div>
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
							{lendo.length === 0 && <p className="metricas-vazio">Nenhum livro em leitura.</p>}
							{lendo.map((livro) => (
								<BookMetricas key={livro.id} livro={livro} />
							))}
						</div>
					</section>
				</section>

				<section className="favoritos-card">
					<h3>Favoritos:</h3>

					<div className="favoritos-lista">
						{favoritos.length === 0 && <p className="metricas-vazio">Nenhum livro favorito.</p>}
						{favoritos.map((livro) => (
							console.log(livro),
							<BookMetricas key={livro.id} livro={livro} />
						))}
					</div>
				</section>

				<div className="metricas-acoes">
					<button
						type="button"
						onClick={() => setPopUp(true)}
						className="botao-circulo"
					>
						CIRCULO +
					</button>
				</div>
				<MetricasModal
					aberto={popUp}
					fechar={() => setPopUp(false)}
					lendo={lendo}
					favoritos={favoritos}
					lerDepois={lerDepois}
					usuarioId={userLog?.id}
					usuario={userLog}
					carregarUsuario={() => carregarUsuario()}
				/>
			</section>
		</main>
	);
}