import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import "./Feed.css";
import PublicacaoCard from "../components/PublicacaoCard";

import {
  obterPublicacoes,
  criarPublicacao
} from "../services/feedService";

import { buscarLivros } from "../services/booksService";

const filtrosNota = [
  { valor: "todas", texto: "Todas" },
  { valor: "5", texto: "5 estrelas" },
  { valor: "4", texto: "4 estrelas" },
  { valor: "3", texto: "3 estrelas" },
  { valor: "2", texto: "2 estrelas" },
  { valor: "1", texto: "1 estrela" },
];

function Feed() {
  const [publicacoes, setPublicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const [formAberto, setFormAberto] = useState(false);

  // Busca e seleção de livros.
  const [buscaLivro, setBuscaLivro] = useState("");
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [livrosEncontrados, setLivrosEncontrados] = useState([]);
  const [buscandoLivros, setBuscandoLivros] = useState(false);
  const [erroBuscaLivro, setErroBuscaLivro] = useState("");

  const [resenha, setResenha] = useState("");
  const [avaliacao, setAvaliacao] = useState(5);
  const [publicando, setPublicando] = useState(false);

  const [pesquisa, setPesquisa] = useState("");
  const [filtroNota, setFiltroNota] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("recentes");

  // Carrega as publicações da API.
  useEffect(() => {
    async function carregarPublicacoes() {
      try {
        setCarregando(true);
        setErro("");

        const dados = await obterPublicacoes();
        setPublicacoes(dados);
      } catch (error) {
        console.error("Erro ao carregar publicações:", error);
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarPublicacoes();
  }, []);

  // Pesquisa livros no mesmo serviço utilizado pelo Catálogo.
  useEffect(() => {
    if (!formAberto || livroSelecionado || buscaLivro.trim().length < 2) {
      setLivrosEncontrados([]);
      setBuscandoLivros(false);
      setErroBuscaLivro("");
      return;
    }

    let cancelado = false;

    const temporizador = setTimeout(async () => {
      try {
        setBuscandoLivros(true);
        setErroBuscaLivro("");

        const resultados = await buscarLivros(buscaLivro.trim());

        if (!cancelado) {
          setLivrosEncontrados(resultados);
        }
      } catch (error) {
        if (!cancelado) {
          console.error("Erro ao pesquisar livros:", error);
          setLivrosEncontrados([]);
          setErroBuscaLivro(
            "Não foi possível pesquisar os livros. Tente novamente."
          );
        }
      } finally {
        if (!cancelado) {
          setBuscandoLivros(false);
        }
      }
    }, 400);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [buscaLivro, livroSelecionado, formAberto]);

  // Seleciona um livro encontrado.
  function selecionarLivro(livro) {
    setLivroSelecionado(livro);
    setBuscaLivro(livro.title);
    setLivrosEncontrados([]);
    setErroBuscaLivro("");
  }

  // Remove o livro selecionado.
  function removerLivroSelecionado() {
    setLivroSelecionado(null);
    setBuscaLivro("");
    setLivrosEncontrados([]);
  }

  // Limpa o formulário.
  function limparFormulario() {
    setBuscaLivro("");
    setLivroSelecionado(null);
    setLivrosEncontrados([]);
    setResenha("");
    setAvaliacao(5);
    setErroBuscaLivro("");
  }

  // Publica uma nova resenha associada a um livro selecionado.
  async function publicarResenha(event) {
    event.preventDefault();

    if (!livroSelecionado || !resenha.trim()) {
      return;
    }

    try {
      setPublicando(true);
      setErroAcao("");


      const novaPublicacao = {
        tituloLivro: livroSelecionado.title,
        livro: {
          id: livroSelecionado.id,
          titulo: livroSelecionado.title,
          autores: livroSelecionado.authors || [],
          capa: livroSelecionado.thumbnail || null,
          ano: livroSelecionado.year || null
        },
        resenha: resenha.trim(),
        avaliacao: Number(avaliacao)
      };

      await criarPublicacao(novaPublicacao);

      const dados = await obterPublicacoes();
      setPublicacoes(dados);

      limparFormulario();
      setFormAberto(false);
      setPesquisa("");
      setFiltroNota("todas");
      setOrdenacao("recentes");
    } catch (error) {
      console.error("Erro ao publicar resenha:", error);
      setErroAcao(error.message);
    } finally {
      setPublicando(false);
    }
  }

  // Pesquisa, filtra e ordena as publicações.
  const publicacoesFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    const resultado = publicacoes.filter((publicacao) => {
      const textoResenha =
        typeof publicacao.resenha === "string"
          ? publicacao.resenha
          : publicacao.resenha?.conteudo || "";

      const correspondePesquisa =
        (publicacao.tituloLivro || "")
          .toLowerCase()
          .includes(termo) ||
        (publicacao.usuario || "")
          .toLowerCase()
          .includes(termo) ||
        (publicacao.userName || "")
          .toLowerCase()
          .includes(termo) ||
        textoResenha.toLowerCase().includes(termo);

      const correspondeNota =
        filtroNota === "todas" ||
        Number(publicacao.avaliacao) === Number(filtroNota);

      return correspondePesquisa && correspondeNota;
    });

    return resultado.sort((a, b) => {
      if (ordenacao === "avaliacao") {
        return Number(b.avaliacao || 0) - Number(a.avaliacao || 0);
      }

      return (
        new Date(b.dataOrdenacao || 0).getTime() -
        new Date(a.dataOrdenacao || 0).getTime()
      );
    });
  }, [publicacoes, pesquisa, filtroNota, ordenacao]);

  return (
    <main className="feed-page">
      <div className="feed-book">
        <div className="feed-book-pages">
          <header className="feed-header">
            <div>
              <h1>Feed</h1>

              <p>
                Descubra leituras e acompanhe as histórias de outros leitores.
              </p>
            </div>

            <div className="feed-header-actions">
              <span className="feed-publication-count">
                <strong>{publicacoes.length}</strong>
                {publicacoes.length === 1
                  ? " publicação"
                  : " publicações"}
              </span>

              <button
                className="feed-create-button"
                type="button"
                onClick={() => setFormAberto((aberto) => !aberto)}
              >
                <span aria-hidden="true">+</span>
                Escrever resenha
              </button>
            </div>
          </header>

          {formAberto && (
            <form className="feed-form" onSubmit={publicarResenha}>
              <div className="feed-form-header">
                <div>
                  <h2>Compartilhe sua opinião</h2>
                </div>

                <button
                  className="feed-close-button"
                  type="button"
                  onClick={() => {
                    limparFormulario();
                    setFormAberto(false);
                  }}
                  aria-label="Fechar formulário"
                >
                  ×
                </button>
              </div>

              <label htmlFor="tituloLivro">
                Pesquisar livro
              </label>

              <div className="feed-book-search">
                <input
                  id="tituloLivro"
                  type="search"
                  placeholder="Digite o título do livro..."
                  value={buscaLivro}
                  onChange={(event) => {
                    setBuscaLivro(event.target.value);
                    setLivroSelecionado(null);
                    setErroBuscaLivro("");
                  }}
                  autoComplete="off"
                  required
                />

                {livroSelecionado && (
                  <button
                    type="button"
                    className="feed-book-remove"
                    onClick={removerLivroSelecionado}
                    aria-label="Remover livro selecionado"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {buscandoLivros && (
                <p className="feed-book-search-message">
                  Pesquisando livros...
                </p>
              )}

              {erroBuscaLivro && (
                <p className="feed-book-search-error">
                  {erroBuscaLivro}
                </p>
              )}

              {!livroSelecionado &&
                buscaLivro.trim().length >= 2 &&
                !buscandoLivros &&
                !erroBuscaLivro &&
                livrosEncontrados.length === 0 && (
                  <p className="feed-book-search-message">
                    Nenhum livro encontrado.
                  </p>
                )}

              {livrosEncontrados.length > 0 && !livroSelecionado && (
                <div className="feed-book-suggestions">
                  {livrosEncontrados.map((livro) => (
                    <button
                      key={livro.id}
                      type="button"
                      className="feed-book-suggestion"
                      onClick={() => selecionarLivro(livro)}
                    >
                      {livro.thumbnail ? (
                        <img
                          src={livro.thumbnail}
                          alt=""
                        />
                      ) : (
                        <span className="feed-book-suggestion-placeholder">
                          📖
                        </span>
                      )}

                      <span className="feed-book-suggestion-info">
                        <strong>{livro.title}</strong>
                        <small>
                          {livro.authors?.join(", ") ||
                            "Autor desconhecido"}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {livroSelecionado && (
                <div className="feed-selected-book">
                  {livroSelecionado.thumbnail ? (
                    <img
                      src={livroSelecionado.thumbnail}
                      alt={`Capa de ${livroSelecionado.title}`}
                    />
                  ) : (
                    <span className="feed-book-suggestion-placeholder">
                      📖
                    </span>
                  )}

                  <div>
                    <strong>{livroSelecionado.title}</strong>
                    <span>
                      {livroSelecionado.authors?.join(", ") ||
                        "Autor desconhecido"}
                    </span>
                    <small>Livro selecionado</small>
                  </div>
                </div>
              )}

              <label htmlFor="avaliacao">
                Sua avaliação
              </label>

              <div
                className="feed-rating"
                role="group"
                aria-label={`Avaliação: ${avaliacao} de 5`}
              >
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button
                    key={estrela}
                    type="button"
                    className={estrela <= avaliacao ? "selected" : ""}
                    onClick={() => setAvaliacao(estrela)}
                    aria-label={`${estrela} ${estrela === 1 ? "estrela" : "estrelas"
                      }`}
                    aria-pressed={avaliacao === estrela}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label htmlFor="resenha">Sua resenha</label>

              <textarea
                id="resenha"
                placeholder="O que você achou dessa leitura?"
                value={resenha}
                onChange={(event) => setResenha(event.target.value)}
                rows={4}
                required
              />

              <div className="feed-form-actions">
                <button
                  className="feed-cancel-button"
                  type="button"
                  onClick={() => {
                    limparFormulario();
                    setFormAberto(false);
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="feed-submit-button"
                  type="submit"
                  disabled={!livroSelecionado || !resenha.trim() || publicando}
                >
                  {publicando ? "Publicando..." : "Publicar resenha"}
                </button>
              </div>
            </form>
          )}

          <div className="feed-search">
            <div className="feed-search__field">
              <Search
                className="feed-search__icon"
                size={20}
                aria-hidden="true"
              />

              <input
                type="search"
                placeholder="Buscar livro, leitor ou resenha..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                aria-label="Pesquisar publicações"
              />

              {pesquisa && (
                <button
                  type="button"
                  className="feed-search__clear"
                  onClick={() => setPesquisa("")}
                  aria-label="Limpar pesquisa"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="feed-toolbar">
            <label className="feed-nota-mobile">
              Avaliação
              <select className="feed-select" value={filtroNota} onChange={(e) => setFiltroNota(e.target.value)}>
                {filtrosNota.map((filtro) => <option key={filtro.valor} value={filtro.valor}>{filtro.texto}</option>)}
              </select>
            </label>
            <div
              className="feed-chips"
              role="group"
              aria-label="Filtrar por avaliação"
            >
              {filtrosNota.map((filtro) => (
                <button
                  key={filtro.valor}
                  type="button"
                  className={`feed-chip ${filtroNota === filtro.valor ? "is-active" : ""
                    }`}
                  onClick={() => setFiltroNota(filtro.valor)}
                  aria-pressed={filtroNota === filtro.valor}
                >
                  {filtro.texto}
                </button>
              ))}
            </div>

            <label className="feed-sort">
              <span>Ordenar por</span>

              <select
                className="feed-select"
                value={ordenacao}
                onChange={(event) => setOrdenacao(event.target.value)}
              >
                <option value="recentes">Mais recentes</option>
                <option value="avaliacao">Maior avaliação</option>
              </select>
            </label>
          </div>

          {erroAcao && (
            <p className="feed-action-error" role="alert">
              {erroAcao}
            </p>
          )}

          <section
            className="feed-publications"
            aria-label="Publicações da comunidade"
          >
            {carregando ? (
              <div className="feed-empty">
                <p>Carregando publicações...</p>
              </div>
            ) : erro ? (
              <div className="feed-empty">
                <h3>Não foi possível carregar o Feed</h3>
                <p>{erro}</p>
              </div>
            ) : publicacoesFiltradas.length > 0 ? (
              <div className="feed-publications-list">
                {publicacoesFiltradas.map((publicacao) => (
                  <PublicacaoCard
                    key={publicacao.id}
                    publicacao={publicacao}
                  />
                ))}
              </div>
            ) : (
              <div className="feed-empty">
                <span aria-hidden="true">📚</span>
                <h3>Nenhuma publicação encontrada</h3>
                <p>
                  Tente mudar a pesquisa ou selecionar outra avaliação.
                </p>

                {(pesquisa || filtroNota !== "todas") && (
                  <button
                    className="feed-cancel-button"
                    type="button"
                    onClick={() => {
                      setPesquisa("");
                      setFiltroNota("todas");
                    }}
                  >
                    Limpar pesquisa e filtros
                  </button>
                )}
              </div>
            )}
          </section>

          <footer className="feed-book-footer">
            <span>BOOKMARK</span>
            <span>Compartilhando histórias</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default Feed;
