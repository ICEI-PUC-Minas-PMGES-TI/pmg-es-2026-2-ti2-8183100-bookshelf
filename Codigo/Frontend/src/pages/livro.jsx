import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { searchBooks } from "../services/booksService";
import detalhes from "../mocks/jsonLivroDetalhes.json";
import "../components/BookCard.css";
import "./livro.css";

const OPCOES_LISTA = ["Favoritos", "Lendo", "Pretendo ler", "Lidos"];

function Estrelas({ nota }) {
  if (nota == null) return <span className="livro-sem-nota">Sem avaliações</span>;
  const cheias = Math.round(nota);
  return (
    <span className="livro-estrelas" aria-label={`Nota ${nota} de 5`}>
      {"★".repeat(cheias)}
      <span className="livro-estrelas__vazia">{"★".repeat(5 - cheias)}</span>
    </span>
  );
}

export default function Livro() {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | naoEncontrado

  useEffect(() => {
    setStatus("loading");
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

            <Estrelas nota={livro.rating} />

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
              <details className="livro-adicionar">
                <summary className="livro-botao">Adicionar à lista</summary>
                <ul className="livro-adicionar__opcoes">
                  {OPCOES_LISTA.map((opcao) => (
                    <li key={opcao}>
                      <button type="button">{opcao}</button>
                    </li>
                  ))}
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
