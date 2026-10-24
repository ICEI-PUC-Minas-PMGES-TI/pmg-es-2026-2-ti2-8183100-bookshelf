import { useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard.jsx";
import { searchBooks } from "../services/booksService";
import "./catalogo.css";

const SORTS = {
  relevancia: { label: "Relevância", fn: null },
  titulo: { label: "Título (A–Z)", fn: (a, b) => a.title.localeCompare(b.title, "pt-BR") },
  nota: { label: "Mais bem avaliados", fn: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) },
  recentes: { label: "Mais recentes", fn: (a, b) => (b.year ?? 0) - (a.year ?? 0) },
};

export default function Catalogo() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [reloadKey, setReloadKey] = useState(0);
  const [category, setCategory] = useState("todos");
  const [sort, setSort] = useState("relevancia");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    searchBooks(query)
      .then((data) => {
        if (cancelled) return;
        setBooks(data);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  const categories = useMemo(
    () => [...new Set(books.map((b) => b.category).filter(Boolean))].sort(),
    [books]
  );

  const visible = useMemo(() => {
    const filtered = category === "todos" ? books : books.filter((b) => b.category === category);
    const fn = SORTS[sort].fn;
    return fn ? [...filtered].sort(fn) : filtered;
  }, [books, category, sort]);

  function handleSubmit(e) {
    e.preventDefault();
    setCategory("todos");
    setQuery(input);
  }

  function clearSearch() {
    setInput("");
    setCategory("todos");
    setQuery("");
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
            <strong>{status === "ok" ? visible.length : "–"}</strong> livros
          </span>
        </header>

        <form className="cat-search" onSubmit={handleSubmit} role="search">
          <div className="cat-search__field">
            <svg className="cat-search__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4"
              />
            </svg>
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Busque por título ou autor"
              aria-label="Buscar livros"
            />
          </div>
          <button type="submit" className="cat-btn">Buscar</button>
          {query && (
            <button type="button" className="cat-btn cat-btn--ghost" onClick={clearSearch}>
              Limpar
            </button>
          )}
        </form>

        <div className="cat-toolbar">
          <div className="cat-chips" role="group" aria-label="Filtrar por gênero">
            <button
              type="button"
              className={`cat-chip ${category === "todos" ? "is-active" : ""}`}
              onClick={() => setCategory("todos")}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`cat-chip ${category === c ? "is-active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="cat-sort" htmlFor="cat-sort">
            Ordenar
            <select id="cat-sort" className="cat-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        <div aria-live="polite">
          {status === "loading" && (
            <div className="cat-grid" aria-busy="true">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="cat-skeleton" />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="cat-message">
              <p>Não foi possível carregar os livros. Verifique sua conexão e tente de novo.</p>
              <button type="button" className="cat-btn" onClick={() => setReloadKey((k) => k + 1)}>
                Tentar novamente
              </button>
            </div>
          )}

          {status === "ok" && visible.length === 0 && (
            <div className="cat-message">
              <p>Nenhum livro encontrado{query ? ` para “${query}”` : ""}. Tente outro título ou autor.</p>
            </div>
          )}

          {status === "ok" && visible.length > 0 && (
            <div className="cat-grid">
              {visible.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}