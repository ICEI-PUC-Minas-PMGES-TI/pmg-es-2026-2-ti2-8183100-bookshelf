import "./BookCard.css";

// Capa do livro, igual à do Catálogo: usa a imagem ou, se não houver, a capa de reserva.
export default function CapaLivro({ livro }) {
  if (livro.thumbnail) {
    return <img className="book-cover" src={livro.thumbnail} alt={`Capa de ${livro.title}`} loading="lazy" draggable="false" />;
  }
  return (
    <div className="book-cover book-cover--fallback">
      <span className="book-cover__brand">Bookmark</span>
      <span className="book-cover__title">{livro.title}</span>
      <span className="book-cover__line" />
    </div>
  );
}
