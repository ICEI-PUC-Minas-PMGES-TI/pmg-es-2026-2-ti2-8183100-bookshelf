import "./metricas.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import BookMetricas from "../components/BookMetricas";
import MetricasModal from "../components/MetricasModal";
import { buscarLivrosPorIds } from "../services/booksService";
import { obterUsuario } from "../services/listasService";

export default function Metricas() {
  const [usuario, setUsuario] = useState(null);
  const [livros, setLivros] = useState([]);
  const [erro, setErro] = useState("");
  const [popUp, setPopUp] = useState(false);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const dados = await obterUsuario();
        const ids = [...new Set([...(dados.livrosLendo ?? []), ...(dados.livrosFav ?? [])])];
        const encontrados = await buscarLivrosPorIds(ids);
        if (!cancelado) {
          setUsuario(dados);
          setLivros(encontrados);
          setErro("");
        }
      } catch {
        if (!cancelado) setErro("Não foi possível carregar suas métricas. Verifique sua conexão e tente novamente.");
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [versao]);

  function livrosDa(chave) {
    return (usuario?.[chave] ?? []).map((id) => livros.find((livro) => livro.id === id)).filter(Boolean);
  }

  return (
    <main className="metricas-main">
      <header className="metricas-topo">
        <div><h1>Seu ritmo de leitura</h1><p>Cada página faz parte da sua história.</p></div>
        <button className="conta-principal" onClick={() => setPopUp(true)} disabled={!usuario}>Registrar leitura</button>
      </header>
      {erro && <div className="conta-erro" role="alert"><p>{erro}</p><button className="perfil-botao" onClick={() => setVersao((v) => v + 1)}>Tentar novamente</button></div>}
      {!usuario && !erro && <p role="status">Carregando suas leituras…</p>}
      {usuario && (
        <>
          <dl className="metricas-resumo">
            <div><dt>Páginas lidas</dt><dd>{Number(usuario.pagsLidas || 0).toLocaleString("pt-BR")}</dd></div>
            <div><dt>Livros concluídos</dt><dd>{usuario.livrosLidos?.length ?? 0}</dd></div>
            <div><dt>Maior sequência</dt><dd className="metrica-sequencia"><Flame aria-hidden="true" />{usuario.sequencia ?? 0}<span> dias</span></dd></div>
          </dl>
          <div className="metricas-colunas">
            <section className="metricas-calendario" aria-labelledby="calendario-titulo">
              <h2 id="calendario-titulo">Calendário de leitura</h2>
              <Calendar locale="pt-BR" prevLabel="‹" nextLabel="›" prev2Label={null} next2Label={null} />
              <p className="metricas-nota">O dia atual está destacado no calendário.</p>
            </section>
            <section className="metricas-livros" aria-labelledby="leituras-titulo">
              <div className="metricas-secao-topo"><h2 id="leituras-titulo">Em leitura</h2><Link to="/perfil">Ver biblioteca</Link></div>
              {livrosDa("livrosLendo").length ? <div className="leituras-lista">{livrosDa("livrosLendo").map((livro) => <BookMetricas key={livro.id} livro={livro} />)}</div> : <p className="metricas-nota">Adicione um livro à lista Lendo para acompanhar por aqui.</p>}
            </section>
          </div>
          <section className="metricas-favoritos" aria-labelledby="favoritos-titulo">
            <h2 id="favoritos-titulo">Seus favoritos</h2>
            {livrosDa("livrosFav").length ? <div className="favoritos-lista">{livrosDa("livrosFav").map((livro) => <BookMetricas key={livro.id} livro={livro} />)}</div> : <p className="metricas-nota">Seus livros favoritos aparecerão aqui.</p>}
          </section>
        </>
      )}
      <MetricasModal aberto={popUp} fechar={() => setPopUp(false)} aoSalvar={() => { setPopUp(false); setVersao((v) => v + 1); }} />
    </main>
  );
}
