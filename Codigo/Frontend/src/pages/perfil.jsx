import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarLivrosPorIds } from "../services/booksService";
import {
  LISTAS,
  obterUsuario,
  salvarUsuario,
  adicionarNaLista,
  removerDaLista,
} from "../services/listasService";
import CapaLivro from "../components/CapaLivro";
import "../components/BookCard.css";
import "./perfil.css";

// Foto usada quando o usuário não tem foto (ou a foto não carrega).
const FOTO_PADRAO = "https://www.gravatar.com/avatar/?d=mp&s=300";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [livros, setLivros] = useState([]);
  const [listaAlvo, setListaAlvo] = useState(null); // lista que está recebendo o arraste
  const [erro, setErro] = useState(false);
  const [aviso, setAviso] = useState("");

  // Carrega o usuário e, depois, cada livro que aparece nas listas dele.
  useEffect(() => {
    obterUsuario()
      .then(async (dadosUsuario) => {
        const ids = LISTAS.flatMap((lista) => dadosUsuario[lista.chave]);
        const encontrados = await buscarLivrosPorIds(ids);
        setUsuario(dadosUsuario);
        setLivros(encontrados);
      })
      .catch(() => setErro(true));
  }, []);

  if (erro) return <main className="perfil-page"><p>Não foi possível carregar o perfil. Verifique sua conexão e recarregue a página.</p></main>;
  if (!usuario) return <main className="perfil-page"><p>Carregando perfil...</p></main>;

  function livrosDaLista(chave) {
    return usuario[chave]
      .map((id) => livros.find((livro) => livro.id === id))
      .filter(Boolean);
  }

  // Atualiza a tela na hora e salva em seguida.
  // Se não conseguir salvar, volta ao que estava e avisa.
  function atualizar(novoUsuario) {
    const anterior = usuario;
    setUsuario(novoUsuario);
    setAviso("");
    salvarUsuario(novoUsuario).catch(() => {
      setUsuario(anterior);
      setAviso("Não foi possível salvar a alteração. Tente de novo.");
    });
  }

  function remover(livroId, chave) {
    atualizar(removerDaLista(usuario, livroId, chave));
  }

  // Guarda qual livro está sendo arrastado e de qual lista ele saiu.
  function iniciarArraste(e, livroId, chave) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ livroId, origem: chave }));
    e.dataTransfer.effectAllowed = "move";
  }

  function soltar(e, chaveDestino) {
    e.preventDefault();
    setListaAlvo(null);
    let dados;
    try {
      dados = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }
    if (dados.origem === chaveDestino) return;
    atualizar(adicionarNaLista(usuario, dados.livroId, chaveDestino));
  }

  return (
    <main className="perfil-page">
      <div className="perfil-moldura">
        <div className="perfil-layout">
          {/* 2. Menu lateral do perfil */}
          <aside className="perfil-menu">
            <img
              className="perfil-foto"
              src={usuario.perfil?.foto || FOTO_PADRAO}
              alt="Foto de perfil"
              onError={(e) => {
                // foto inválida ou fora do ar: troca pela padrão (sem entrar em loop)
                if (e.currentTarget.src !== FOTO_PADRAO) e.currentTarget.src = FOTO_PADRAO;
              }}
            />
            <h1 className="perfil-usuario">{usuario.userName || usuario.nome}</h1>
            <p className="perfil-seguidores">
              <strong>{usuario.seguidores ?? 0}</strong> seguidores · <strong>{usuario.seguindo ?? 0}</strong> seguindo
            </p>
            {usuario.perfil?.bio && <p className="perfil-bio">{usuario.perfil.bio}</p>}

            <nav className="perfil-botoes" aria-label="Menu do perfil">
              <a className="perfil-botao" href="#favoritos">Favoritos</a>
              <button type="button" className="perfil-botao">Editar perfil</button>
              <button type="button" className="perfil-botao">Configurações</button>
            </nav>
          </aside>

          {/* 3. Listas de livros */}
          <section className="perfil-listas">
            {aviso && <p className="perfil-aviso" role="alert">{aviso}</p>}
            {LISTAS.map((lista) => {
              const itens = livrosDaLista(lista.chave);
              return (
                <article
                  key={lista.chave}
                  id={lista.chave === "livrosFav" ? "favoritos" : undefined}
                  className={`perfil-lista ${listaAlvo === lista.chave ? "is-alvo" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault(); // permite soltar aqui
                    e.dataTransfer.dropEffect = "move";
                    setListaAlvo(lista.chave);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setListaAlvo(null);
                  }}
                  onDrop={(e) => soltar(e, lista.chave)}
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
                      <div
                        key={livro.id}
                        className="perfil-livro"
                        draggable={lista.chave !== "livrosFav"}
                        onDragStart={(e) => iniciarArraste(e, livro.id, lista.chave)}
                        onDragEnd={() => setListaAlvo(null)}
                      >
                        <Link to={`/livro/${livro.id}`} className="perfil-livro__link" title={livro.title} draggable="false">
                          <CapaLivro livro={livro} />
                        </Link>
                        {/* 5. Remover livro da lista */}
                        <button
                          type="button"
                          className="perfil-livro__remover"
                          onClick={() => remover(livro.id, lista.chave)}
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
