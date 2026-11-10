import "./metricas.css";
import { useEffect, useState } from "react";
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import BookMetricas from "../components/BookMetricas";
import MetricasModal from "../components/MetricasModal";
import { buscarLivrosPorIds } from "../services/booksService";
import { buscarMetricas } from "../services/metricasService";
import { obterUsuario } from "../services/listasService";
import { formatarData, obterDiasStreak } from "../services/leituraUtils";
import { Flame } from "lucide-react";
import "../components/contaForm.css";

export default function Metricas() {
	const [usuario, setUsuario] = useState(null);
	const [livros, setLivros] = useState([]);
	const [userLog] = useState(() => JSON.parse(localStorage.getItem("usuario") || "null"));
	const [erro, setErro] = useState("");
	const [versao, setVersao] = useState(0);
	const [popUp, setPopUp] = useState(false);
	const [metricas, setMetricas] = useState([]);
	const diasStreak = obterDiasStreak(metricas);

	useEffect(() => {
		let cancelado = false;
		async function carregar() {
			try {
				if (!userLog?.id) throw new Error("Sua sessão expirou. Entre novamente.");
				const [data, registros] = await Promise.all([obterUsuario(), buscarMetricas(userLog.id)]);
				const ids = [...new Set([...(data.livrosLendo ?? []), ...(data.livrosFav ?? []), ...(data.livrosLerDepois ?? [])])];
				const encontrados = await buscarLivrosPorIds(ids);
				if (!cancelado) { setUsuario(data); setMetricas(registros); setLivros(encontrados); setErro(""); }
			} catch {
				if (!cancelado) setErro("Não foi possível carregar suas métricas. Verifique sua conexão e tente novamente.");
			}
		}
		carregar();
		return () => { cancelado = true; };
	}, [userLog, versao]);

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
			{erro && <div className="conta-erro" role="alert">{erro} <button onClick={() => setVersao((v) => v + 1)}>Tentar novamente</button></div>}
			{!usuario && !erro && <p role="status">Carregando suas leituras…</p>}
			<section className="metricas-layout">
				<aside className="estatisticas">
					<h2>Estatísticas:</h2>

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
					<Calendar
						locale="pt-BR"
						tileClassName={({ date, view }) => {
							if (view !== "month") return null;

							const data = formatarData(date);

							return diasStreak.has(data)
								? "dia-com-streak"
								: null;
						}}
					/>
				</section>

				<section className="metricas-direita">
					<div className="streak-card">
						<h2>Streak Máximo:</h2>
						<strong>{usuario?.sequencia || 0}</strong>
						<Flame className="streak-fogo" aria-hidden="true" />
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
							<BookMetricas key={livro.id} livro={livro} />
						))}
					</div>
				</section>

				<div className="metricas-acoes">
					<button
						type="button"
						onClick={() => setPopUp(true)}
						className="botao-circulo"
						disabled={!usuario}
					>
						Registrar leitura
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
					aoSalvar={() => { setPopUp(false); setVersao((v) => v + 1); }}
				/>
			</section>
		</main>
	);
}
