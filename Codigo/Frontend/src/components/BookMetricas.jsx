import { Link } from "react-router-dom";
import CapaLivro from "./CapaLivro";
import "./BookMetricas.css";

// Card de livro da página de Métricas: mesma capa do Catálogo e do Perfil, e leva à página do livro.
// A largura vem da variável --capa-largura, definida pela lista que o contém.
function BookMetricas({ livro }) {
  const autores = livro.authors.length ? livro.authors.join(", ") : "Autor desconhecido";

  return (
    <Link to={`/livro/${livro.id}`} className="card-livro" title={livro.title}>
      <CapaLivro livro={livro} />
      <h3>{livro.title}</h3>
      <p>{autores}</p>
    </Link>
  );
}

export default BookMetricas;
