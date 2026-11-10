import "./BookCard.css";
import { useState } from "react";

// Capa do livro, igual à do Catálogo: usa a imagem ou, se não houver, a capa de reserva.
export default function CapaLivro({ livro }) {
  const [imagemComErro, setImagemComErro] = useState(null);
  if (livro.thumbnail && livro.thumbnail !== imagemComErro) {
    return <img className="book-cover" src={livro.thumbnail} alt={`Capa de ${livro.title}`} loading="lazy" draggable="false" onError={() => setImagemComErro(livro.thumbnail)} />;
  }
  return (
    <div className="book-cover book-cover--fallback">
      <span className="book-cover__brand">Bookmark</span>
      <span className="book-cover__title">{livro.title}</span>
      <span className="book-cover__line" />
    </div>
  );
}
