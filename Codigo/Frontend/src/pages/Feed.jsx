
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import "./Feed.css";
import PublicacaoCard from "../components/PublicacaoCard";
import {
  obterPublicacoes,
  salvarPublicacoes,
} from "../services/feedService";

const filtrosNota = [
  { valor: "todas", texto: "Todas" },
  { valor: "5", texto: "5 estrelas" },
  { valor: "4", texto: "4 estrelas" },
  { valor: "3", texto: "3 estrelas" },
  { valor: "2", texto: "2 estrelas" },
  { valor: "1", texto: "1 estrela" },
];

function Feed() {
  // Carrega as publicações salvas ou utiliza os dados do JSON mock.
  const [publicacoes, setPublicacoes] = useState(
    () => obterPublicacoes()
  );

  const [formAberto, setFormAberto] = useState(false);
  const [tituloLivro, setTituloLivro] = useState("");
  const [resenha, setResenha] = useState("");
  const [avaliacao, setAvaliacao] = useState(5);

  const [pesquisa, setPesquisa] = useState("");
  const [filtroNota, setFiltroNota] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("recentes");

  // Salva as publicações sempre que houver alguma alteração.
  useEffect(() => {
    salvarPublicacoes(publicacoes);
  }, [publicacoes]);

  // Alterna a curtida de uma publicação.
  function alternarCurtida(id) {
    setPublicacoes((atuais) =>
      atuais.map((publicacao) => {
        if (publicacao.id !== id) {
          return publicacao;
        }

        const curtiu = !publicacao.curtiu;

        return {
          ...publicacao,
          curtiu,
          curtidas:
            publicacao.curtidas + (curtiu ? 1 : -1),
        };
      })
    );
  }

  // Publica uma nova resenha.
  function publicarResenha(event) {
    event.preventDefault();

    if (!tituloLivro.trim() || !resenha.trim()) {
      return;
    }

    const novaPublicacao = {
      id: Date.now(),
      usuario: "Giovanni Arenare",
      userName: "giovanni",
      tituloLivro: tituloLivro.trim(),
      dataPublicacao: new Date().toLocaleDateString("pt-BR"),
      resenha: resenha.trim(),
      avaliacao,
      curtidas: 0,
      curtiu: false,
    };

    setPublicacoes((atuais) => [
      novaPublicacao,
      ...atuais,
    ]);

    setTituloLivro("");
    setResenha("");
    setAvaliacao(5);
    setFormAberto(false);
    setPesquisa("");
    setFiltroNota("todas");
    setOrdenacao("recentes");
  }

  // Pesquisa, filtra e ordena as publicações.
  const publicacoesFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    const resultado = publicacoes.filter((publicacao) => {
      const correspondePesquisa =
        publicacao.tituloLivro.toLowerCase().includes(termo) ||
        publicacao.usuario.toLowerCase().includes(termo) ||
        publicacao.userName.toLowerCase().includes(termo) ||
        publicacao.resenha.toLowerCase().includes(termo);

      const correspondeNota =
        filtroNota === "todas" ||
        publicacao.avaliacao === Number(filtroNota);

      return correspondePesquisa && correspondeNota;
    });

    return resultado.sort((a, b) => {
      if (ordenacao === "curtidas") {
        return b.curtidas - a.curtidas;
      }

      if (ordenacao === "avaliacao") {
        return b.avaliacao - a.avaliacao;
      }

      // IDs maiores representam publicações mais recentes.
      return b.id - a.id;
    });
  }, [publicacoes, pesquisa, filtroNota, ordenacao]);

  return (
    <main className="feed-page">
      <div className="feed-book">
        <div className="feed-book-pages">
          <header className="feed-header">
            <div>
              <span className="feed-eyebrow">
                COMUNIDADE BOOKMARK
              </span>

              <h1>Feed</h1>

              <p>
                Descubra leituras, compartilhe opiniões e acompanhe
                a jornada <br /> de outros leitores.
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
                onClick={() =>
                  setFormAberto((aberto) => !aberto)
                }
              >
                <span aria-hidden="true">+</span>
                Escrever resenha
              </button>
            </div>
          </header>

          {formAberto && (
            <form
              className="feed-form"
              onSubmit={publicarResenha}
            >
              <div className="feed-form-header">
                <div>
                  <span className="feed-eyebrow">
                    SUA LEITURA
                  </span>
                  <h2>Compartilhe sua opinião</h2>
                </div>

                <button
                  className="feed-close-button"
                  type="button"
                  onClick={() => setFormAberto(false)}
                  aria-label="Fechar formulário"
                >
                  ×
                </button>
              </div>

              <label htmlFor="tituloLivro">
                Nome do livro
              </label>

              <input
                id="tituloLivro"
                type="text"
                placeholder="Qual livro você leu?"
                value={tituloLivro}
                onChange={(event) =>
                  setTituloLivro(event.target.value)
                }
                required
              />

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
                    className={
                      estrela <= avaliacao ? "selected" : ""
                    }
                    onClick={() => setAvaliacao(estrela)}
                    aria-label={`${estrela} ${
                      estrela === 1 ? "estrela" : "estrelas"
                    }`}
                    aria-pressed={avaliacao === estrela}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label htmlFor="resenha">
                Sua resenha
              </label>

              <textarea
                id="resenha"
                placeholder="O que você achou dessa leitura?"
                value={resenha}
                onChange={(event) =>
                  setResenha(event.target.value)
                }
                rows={4}
                required
              />

              <div className="feed-form-actions">
                <button
                  className="feed-cancel-button"
                  type="button"
                  onClick={() => setFormAberto(false)}
                >
                  Cancelar
                </button>

                <button
                  className="feed-submit-button"
                  type="submit"
                >
                  Publicar resenha
                </button>
              </div>
            </form>
          )}

          {/* Barra de pesquisa */}
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
                onChange={(event) =>
                  setPesquisa(event.target.value)
                }
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

          {/* Filtros e ordenação */}
          <div className="feed-toolbar">
            <div
              className="feed-chips"
              role="group"
              aria-label="Filtrar por avaliação"
            >
              {filtrosNota.map((filtro) => (
                <button
                  key={filtro.valor}
                  type="button"
                  className={`feed-chip ${
                    filtroNota === filtro.valor
                      ? "is-active"
                      : ""
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
                onChange={(event) =>
                  setOrdenacao(event.target.value)
                }
              >
                <option value="recentes">Mais recentes</option>
                <option value="curtidas">Mais curtidas</option>
                <option value="avaliacao">Maior avaliação</option>
              </select>
            </label>
          </div>

          {/* Lista de publicações */}
          <section
            className="feed-publications"
            aria-label="Publicações da comunidade"
          >
            {publicacoesFiltradas.length > 0 ? (
              <div className="feed-publications-list">
                {publicacoesFiltradas.map((publicacao) => (
                  <PublicacaoCard
                    key={publicacao.id}
                    publicacao={publicacao}
                    onCurtir={() =>
                      alternarCurtida(publicacao.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="feed-empty">
                <span aria-hidden="true">📚</span>

                <h3>Nenhuma publicação encontrada</h3>

                <p>
                  Tente mudar a pesquisa ou selecionar outra
                  avaliação.
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
