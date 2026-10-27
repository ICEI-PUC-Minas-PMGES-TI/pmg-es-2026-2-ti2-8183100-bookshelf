import { useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard.jsx";
import { buscarLivros } from "../services/booksService";
import "./catalogo.css";

const ORDENACOES = {
  relevancia: { rotulo: "Relevância", funcao: null },
  titulo: { rotulo: "Título (A–Z)", funcao: (a, b) => a.title.localeCompare(b.title, "pt-BR") },
  nota: { rotulo: "Mais bem avaliados", funcao: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) },
  recentes: { rotulo: "Mais recentes", funcao: (a, b) => (b.year ?? 0) - (a.year ?? 0) },
};

export default function Catalogo() {
  // Estados dos inputs (Rascunho visual no formulário)
  const [textoBusca, setTextoBusca] = useState("");
  const [idiomaSelecionado, setIdiomaSelecionado] = useState("");
  const [tipoPublicacaoSelecionado, setTipoPublicacaoSelecionado] = useState("all");

  // Estados aplicados (O que de fato aciona a requisição à API)
  const [pesquisaAtiva, setPesquisaAtiva] = useState("");
  const [filtrosAtivos, setFiltrosAtivos] = useState({ idioma: "", tipoPublicacao: "all" });
  
  // Estados do catálogo de livros
  const [livros, setLivros] = useState([]);
  const [estadoCarga, setEstadoCarga] = useState("carregando"); // carregando | sucesso | erro
  const [mensagemErro, setMensagemErro] = useState("");
  const [chaveRecarregamento, setChaveRecarregamento] = useState(0);
  
  // Filtros locais em memória (não fazem requisição)
  const [categoriaAtual, setCategoriaAtual] = useState("todos");
  const [ordenacaoAtual, setOrdenacaoAtual] = useState("relevancia");

  useEffect(() => {
    let cancelado = false;
    setEstadoCarga("carregando");
    
    buscarLivros(pesquisaAtiva, filtrosAtivos)
      .then((dados) => {
        if (cancelado) return;
        setLivros(dados);
        setEstadoCarga("sucesso");
      })
      .catch((erro) => {
        if (!cancelado) {
          setMensagemErro(erro.message);
          setEstadoCarga("erro");
        }
      });
      
    return () => {
      cancelado = true;
    };
  }, [pesquisaAtiva, filtrosAtivos, chaveRecarregamento]);

  // Extrai as categorias únicas dos livros retornados pela API
  const categoriasDisponiveis = useMemo(
    () => [...new Set(livros.map((livro) => livro.category).filter(Boolean))].sort(),
    [livros]
  );

  // Aplica o filtro de categoria local e a ordenação selecionada
  const livrosVisiveis = useMemo(() => {
    const filtrados = categoriaAtual === "todos" 
      ? livros 
      : livros.filter((livro) => livro.category === categoriaAtual);
      
    const funcaoOrdenacao = ORDENACOES[ordenacaoAtual].funcao;
    return funcaoOrdenacao ? [...filtrados].sort(funcaoOrdenacao) : filtrados;
  }, [livros, categoriaAtual, ordenacaoAtual]);

  function submeterPesquisa(evento) {
    evento.preventDefault();
    setCategoriaAtual("todos");
    setPesquisaAtiva(textoBusca);
    setFiltrosAtivos({ idioma: idiomaSelecionado, tipoPublicacao: tipoPublicacaoSelecionado });
  }

  function limparPesquisa() {
    setTextoBusca("");
    setIdiomaSelecionado("");
    setTipoPublicacaoSelecionado("all");
    setCategoriaAtual("todos");
    setPesquisaAtiva("");
    setFiltrosAtivos({ idioma: "", tipoPublicacao: "all" });
  }

  return (
    <main className="cat-page">
      <section className="cat-panel">
        <header className="cat-header">
          <div>
            <h1 className="cat-title">Catálogo</h1>
            <p className="cat-subtitle">Encontre o próximo livro, veja as notas e escolha o que ler.</p>
          </div>
          <span className="cat-count">
            <strong>{estadoCarga === "sucesso" ? livrosVisiveis.length : "–"}</strong> livros
          </span>
        </header>

        <form className="cat-search" onSubmit={submeterPesquisa} role="search">
          <div className="cat-search__field">
            <svg className="cat-search__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4" />
            </svg>
            <input
              type="search"
              value={textoBusca}
              onChange={(evento) => setTextoBusca(evento.target.value)}
              placeholder="Busque por título ou autor"
              aria-label="Buscar livros"
            />
          </div>
          
          <select 
            className="cat-select" 
            value={idiomaSelecionado} 
            onChange={(evento) => setIdiomaSelecionado(evento.target.value)} 
            aria-label="Filtrar por idioma"
          >
            <option value="">Qualquer idioma</option>
            <option value="pt">Português</option>
            <option value="en">Inglês</option>
          </select>

          <select 
            className="cat-select" 
            value={tipoPublicacaoSelecionado} 
            onChange={(evento) => setTipoPublicacaoSelecionado(evento.target.value)} 
            aria-label="Filtrar por tipo de publicação"
          >
            <option value="all">Todos os tipos</option>
            <option value="books">Apenas Livros</option>
            <option value="magazines">Revistas</option>
          </select>

          <button type="submit" className="cat-btn">Buscar</button>
          
          {(pesquisaAtiva || filtrosAtivos.idioma || filtrosAtivos.tipoPublicacao !== 'all') && (
            <button type="button" className="cat-btn cat-btn--ghost" onClick={limparPesquisa}>
              Limpar
            </button>
          )}
        </form>

        <div className="cat-toolbar">
          <div className="cat-chips" role="group" aria-label="Filtrar por gênero">
            <button
              type="button"
              className={`cat-chip ${categoriaAtual === "todos" ? "is-active" : ""}`}
              onClick={() => setCategoriaAtual("todos")}
            >
              Todos
            </button>
            {categoriasDisponiveis.map((categoria) => (
              <button
                key={categoria}
                type="button"
                className={`cat-chip ${categoriaAtual === categoria ? "is-active" : ""}`}
                onClick={() => setCategoriaAtual(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>

          <label className="cat-sort" htmlFor="cat-sort">
            Ordenar
            <select 
              id="cat-sort" 
              className="cat-select" 
              value={ordenacaoAtual} 
              onChange={(evento) => setOrdenacaoAtual(evento.target.value)}
            >
              {Object.entries(ORDENACOES).map(([chave, { rotulo }]) => (
                <option key={chave} value={chave}>{rotulo}</option>
              ))}
            </select>
          </label>
        </div>

        <div aria-live="polite">
          {estadoCarga === "carregando" && (
            <div className="cat-grid" aria-busy="true">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="cat-skeleton" />
              ))}
            </div>
          )}

          {estadoCarga === "erro" && (
            <div className="cat-message">
              <p>{mensagemErro}</p>
              <button type="button" className="cat-btn" onClick={() => setChaveRecarregamento((chave) => chave + 1)}>
                Tentar novamente
              </button>
            </div>
          )}

          {estadoCarga === "sucesso" && livrosVisiveis.length === 0 && (
            <div className="cat-message">
              <p>Nenhum livro encontrado. Tente ajustar os filtros ou buscar outro título.</p>
            </div>
          )}

          {estadoCarga === "sucesso" && livrosVisiveis.length > 0 && (
            <div className="cat-grid">
              {livrosVisiveis.map((livro) => (
                <BookCard key={livro.id} book={livro} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}