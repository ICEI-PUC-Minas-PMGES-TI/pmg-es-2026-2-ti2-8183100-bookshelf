import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchBooks } from "../services/booksService";
import dadosUsuario from "../mocks/jsonUsuario.json";
import "../components/BookCard.css";
import "./perfil.css";

// As quatro listas exibidas na tela. "chave" é o campo do JSON do usuário.
const LISTAS = [
  { chave: "livrosFav", titulo: "Favoritos" },
  { chave: "livrosLendo", titulo: "Lendo" },
  { chave: "livrosLerDepois", titulo: "Pretendo ler" },
  { chave: "livrosLidos", titulo: "Lidos" },
];

// Capa do livro (usa a imagem ou, se não houver, a capa de reserva).
function CapaLivro({ livro }) {
  if (livro.thumbnail) {
    return <img className="book-cover" src={livro.thumbnail} alt={`Capa de ${livro.title}`} />;
  }
  return (
    <div className="book-cover book-cover--fallback">
      <span className="book-cover__brand">Bookmark</span>
      <span className="book-cover__title">{livro.title}</span>
      <span className="book-cover__line" />
    </div>
  );
}

export default function Perfil() {
  const usuario = dadosUsuario.usuario;
  const [livros, setLivros] = useState([]);

  // Busca o catálogo para transformar os ids das listas em livros.
  useEffect(() => {
    searchBooks("").then(setLivros);
  }, []);

  function livrosDaLista(chave) {
    return usuario[chave]
      .map((id) => livros.find((livro) => livro.id === id))
      .filter(Boolean);
  }

  return (
    <main className="perfil-page">
      <div className="perfil-moldura">
        <div className="perfil-layout">
          {/* 2. Menu lateral do perfil */}
          <aside className="perfil-menu">
            <img className="perfil-foto" src={usuario.perfil.foto} alt="Foto de perfil" />
            <h1 className="perfil-usuario">{usuario.userName}</h1>
            <p className="perfil-seguidores">
              <strong>{usuario.seguidores}</strong> seguidores · <strong>{usuario.seguindo}</strong> seguindo
            </p>
            <p className="perfil-bio">{usuario.perfil.bio}</p>

            <nav className="perfil-botoes" aria-label="Menu do perfil">
              <a className="perfil-botao" href="#favoritos">Favoritos</a>
              <button type="button" className="perfil-botao">Editar perfil</button>
              <button type="button" className="perfil-botao">Configurações</button>
            </nav>
          </aside>

          {/* 3. Listas de livros */}
          <section className="perfil-listas">
            {LISTAS.map((lista) => {
              const itens = livrosDaLista(lista.chave);
              return (
                <article
                  key={lista.chave}
                  id={lista.chave === "livrosFav" ? "favoritos" : undefined}
                  className="perfil-lista"
                >
                  <header className="perfil-lista__topo">
                    <h2>{lista.titulo}</h2>
                    <span className="perfil-lista__contagem">{itens.length}</span>
                  </header>

                  <div className="perfil-lista__capas">
                    {itens.length === 0 && (
                      <p className="perfil-lista__vazia">Nenhum livro nesta lista.</p>
                    )}
                    {itens.map((livro) => (
                      <div key={livro.id} className="perfil-livro" draggable="true">
                        <Link to={`/livro/${livro.id}`} className="perfil-livro__link" title={livro.title}>
                          <CapaLivro livro={livro} />
                        </Link>
                        {/* 5. Remover livro da lista */}
                        <button
                          type="button"
                          className="perfil-livro__remover"
                          aria-label={`Remover ${livro.title} da lista ${lista.titulo}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
