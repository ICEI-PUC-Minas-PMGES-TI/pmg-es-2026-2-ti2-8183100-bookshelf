import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { searchBooks } from "../services/booksService";
import {
  LISTAS,
  obterUsuario,
  salvarUsuario,
  adicionarNaLista,
  removerDaLista,
  statusDoLivro,
  notaDoLivro,
  definirNota,
} from "../services/listasService";
import detalhes from "../mocks/jsonLivroDetalhes.json";
import "../components/BookCard.css";
import "./livro.css";

// Estrelas clicáveis. Mostra a nota do usuário; sem ela, mostra a média do livro.
// Clicar na estrela da nota atual remove a avaliação.
function Avaliacao({ media, nota, aoAvaliar }) {
  const [hover, setHover] = useState(0);
  const exibida = hover || nota || Math.round(media ?? 0);

  function clicar(valor) {
    aoAvaliar(valor === nota ? null : valor);
  }

  return (
    <div className="livro-avaliacao">
      <div className="livro-estrelas" role="group" aria-label="Avaliar o livro" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((valor) => (
          <button
            key={valor}
            type="button"
            className={`livro-estrela ${valor <= exibida ? "is-cheia" : ""} ${nota ? "is-sua" : ""}`}
            aria-label={`${valor} ${valor === 1 ? "estrela" : "estrelas"}`}
            aria-pressed={valor === nota}
            onMouseEnter={() => setHover(valor)}
            onClick={() => clicar(valor)}
          >
            ★
          </button>
        ))}
      </div>
      <span className="livro-nota-texto">
        {nota
          ? `Sua nota: ${nota}/5`
          : media != null
            ? `Média ${media}/5 · clique para avaliar`
            : "Sem avaliações · clique para avaliar"}
      </span>
    </div>
  );
}

export default function Livro() {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | naoEncontrado
  const [usuario, setUsuario] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    obterUsuario().then(setUsuario).catch(() => setUsuario(null));
  }, []);

  useEffect(() => {
    searchBooks("").then((todos) => {
      const encontrado = todos.find((l) => l.id === id);
      setLivro(encontrado ?? null);
      setStatus(encontrado ? "ok" : "naoEncontrado");
    });
  }, [id]);

  if (status === "loading") {
    return (
      <main className="livro-page">
        <div className="livro-moldura"><div className="livro-paginas">Carregando livro...</div></div>
      </main>
    );
  }

  if (status === "naoEncontrado") {
    return (
      <main className="livro-page">
        <div className="livro-moldura">
          <div className="livro-paginas">
            <p>Livro não encontrado.</p>
            <Link to="/catalogo" className="livro-botao">Voltar ao catálogo</Link>
          </div>
        </div>
      </main>
    );
  }

  // Escolher Favoritos liga/desliga o favorito; as outras listas trocam a lista de status.
  function escolherLista(chave) {
    if (!usuario) return;
    let novo;
    if (chave === "livrosFav" && usuario.livrosFav.includes(livro.id)) {
      novo = removerDaLista(usuario, livro.id, "livrosFav");
    } else {
      novo = adicionarNaLista(usuario, livro.id, chave);
    }
    setUsuario(novo);
    salvarUsuario(novo);
    if (menuRef.current) menuRef.current.open = false;
  }

  // Salva a nota que o usuário escolheu (null remove).
  function avaliar(nota) {
    if (!usuario) return;
    const novo = definirNota(usuario, livro.id, nota);
    setUsuario(novo);
    salvarUsuario(novo);
  }

  const statusAtual = usuario ? statusDoLivro(usuario, livro.id) : null;
  const jaEmLista = usuario && (statusAtual || usuario.livrosFav.includes(livro.id));
  const extra = detalhes[livro.id] ?? {};
  const autores = livro.authors.length ? livro.authors.join(", ") : "Autor desconhecido";

  return (
    <main className="livro-page">
      <div className="livro-moldura">
        <div className="livro-paginas">
          {/* 7. Capa, avaliação e ficha do livro */}
          <aside className="livro-lateral">
            {livro.thumbnail ? (
              <img className="book-cover" src={livro.thumbnail} alt={`Capa de ${livro.title}`} />
            ) : (
              <div className="book-cover book-cover--fallback">
                <span className="book-cover__brand">Bookmark</span>
                <span className="book-cover__title">{livro.title}</span>
                <span className="book-cover__line" />
              </div>
            )}

            <Avaliacao
              media={livro.rating}
              nota={usuario ? notaDoLivro(usuario, livro.id) : null}
              aoAvaliar={avaliar}
            />

            <dl className="livro-ficha">
              <dt>Autor</dt>
              <dd>{autores}</dd>
              <dt>Ano</dt>
              <dd>{livro.year ?? "—"}</dd>
              <dt>Editora</dt>
              <dd>{extra.editora ?? "—"}</dd>
            </dl>
          </aside>

          <div className="livro-conteudo">
            <header className="livro-cabecalho">
              <div>
                <h1 className="livro-titulo">{livro.title}</h1>
                {livro.category && <span className="livro-categoria">{livro.category}</span>}
              </div>

              {/* 6. Botão de adicionar à lista */}
              <details className="livro-adicionar" ref={menuRef}>
                <summary className="livro-botao">{jaEmLista ? "Alterar lista" : "Adicionar à lista"}</summary>
                <ul className="livro-adicionar__opcoes">
                  {LISTAS.map((lista) => {
                    const ativa = usuario && usuario[lista.chave].includes(livro.id);
                    return (
                      <li key={lista.chave}>
                        <button
                          type="button"
                          className={ativa ? "is-ativa" : ""}
                          aria-pressed={Boolean(ativa)}
                          onClick={() => escolherLista(lista.chave)}
                        >
                          {ativa ? "✓ " : ""}{lista.titulo}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </header>

            {/* 8. Sinopse e Sobre o autor */}
            <section className="livro-caixa">
              <h2>Sinopse:</h2>
              <p>{livro.description || "Este livro ainda não tem sinopse."}</p>
            </section>

            <section className="livro-caixa">
              <h2>Sobre o autor:</h2>
              <p>{extra.sobreAutor ?? "Ainda não há informações sobre o autor."}</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
