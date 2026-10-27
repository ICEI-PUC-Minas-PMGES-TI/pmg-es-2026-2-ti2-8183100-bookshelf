import { Link } from "react-router-dom";
import "./BookCard.css";

function BookIcon() {
  return (
    <svg className="book-card__pill-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 2h11a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm1 2v16h10a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7zm2 3h6v2H9V7z"
      />
    </svg>
  );
}

function Stars({ rating }) {
  if (rating == null) return <span className="book-card__no-rating">Sem avaliações</span>;
  const filled = Math.round(rating);
  return (
    <span className="book-card__rating" aria-label={`Nota ${rating} de 5`}>
      <span aria-hidden="true">
        {"★".repeat(filled)}
        <span className="book-card__star-off">{"★".repeat(5 - filled)}</span>
      </span>
      <span className="book-card__rating-num">{rating}/5</span>
    </span>
  );
}

// Capa de reserva quando o livro não tem imagem (mesma linguagem das capas do Feed).
function CoverFallback({ title }) {
  return (
    <div className="book-cover book-cover--fallback">
      <span className="book-cover__brand">Bookmark</span>
      <span className="book-cover__title">{title}</span>
      <span className="book-cover__line" />
    </div>
  );
}

export default function BookCard({ book }) {
  const authors = book.authors.length ? book.authors.join(", ") : "Autor desconhecido";

  return (
    <article className="book-card">
      <Link to={`/livro/${book.id}`} className="book-card__cover book-card__link">
        {book.thumbnail ? (
          <img className="book-cover" src={book.thumbnail} alt={`Capa de ${book.title}`} loading="lazy" />
        ) : (
          <CoverFallback title={book.title} />
        )}
      </Link>

      {book.category && (
        <span className="book-card__pill">
          <BookIcon />
          {book.category}
        </span>
      )}
      <h3 className="book-card__title">
        <Link to={`/livro/${book.id}`} className="book-card__link">{book.title}</Link>
      </h3>
      <p className="book-card__author">{authors}</p>
      <div className="book-card__meta">
        <Stars rating={book.rating} />
        {book.year && <span className="book-card__year">{book.year}</span>}
      </div>
    </article>
  );
}