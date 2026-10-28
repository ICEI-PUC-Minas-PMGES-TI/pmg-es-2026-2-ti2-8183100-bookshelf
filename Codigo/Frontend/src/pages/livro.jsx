import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buscarLivroPorId, ErroLivroNaoEncontrado } from "../services/booksService";
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
import { buscarSobreAutor } from "../services/autorService";
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
  const [status, setStatus] = useState("loading"); // loading | ok | naoEncontrado | erro
  const [mensagemErro, setMensagemErro] = useState("");
  const [usuario, setUsuario] = useState(null);
  const menuRef = useRef(null);
  const [aviso, setAviso] = useState("");
  const [sobreAutor, setSobreAutor] = useState({ estado: "carregando", texto: "", fonte: null });

  useEffect(() => {
    obterUsuario().then(setUsuario).catch(() => setUsuario(null));
  }, []);

  useEffect(() => {
    let cancelado = false;
    buscarLivroPorId(id)
      .then((encontrado) => {
        if (cancelado) return;
        setLivro(encontrado);
        setStatus("ok");
      })
      .catch((erro) => {
        if (cancelado) return;
        setMensagemErro(erro.message);
        setStatus(erro instanceof ErroLivroNaoEncontrado ? "naoEncontrado" : "erro");
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  // Biografia do primeiro autor (Wikipédia)
  const primeiroAutor = livro?.authors?.[0];
  useEffect(() => {
    let cancelado = false;
    buscarSobreAutor(primeiroAutor).then((resumo) => {
      if (cancelado) return;
      setSobreAutor(
        resumo
          ? { estado: "ok", texto: resumo.texto, fonte: resumo.fonte }
          : { estado: "vazio", texto: "", fonte: null },
      );
    });
    return () => {
      cancelado = true;
    };
  }, [primeiroAutor]);

  if (status === "loading") {
    return (
      <main className="livro-page">
        <div className="livro-moldura"><div className="livro-paginas">Carregando livro...</div></div>
      </main>
    );
  }

  if (status === "naoEncontrado" || status === "erro") {
    return (
      <main className="livro-page">
        <div className="livro-moldura">
          <div className="livro-paginas">
            <p>{status === "naoEncontrado" ? "Livro não encontrado." : mensagemErro}</p>
            <Link to="/catalogo" className="livro-botao">Voltar ao catálogo</Link>
          </div>
        </div>
      </main>
    );
  }

  // Atualiza a tela na hora e salva; se não conseguir salvar, volta ao que estava e avisa.
  function gravar(novo) {
    const anterior = usuario;
    setUsuario(novo);
    setAviso("");
    salvarUsuario(novo).catch(() => {
      setUsuario(anterior);
      setAviso("Não foi possível salvar a alteração. Tente de novo.");
    });
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
    gravar(novo);
    if (menuRef.current) menuRef.current.open = false;
  }

  // Salva a nota que o usuário escolheu (null remove).
  function avaliar(nota) {
    if (!usuario) return;
    gravar(definirNota(usuario, livro.id, nota));
  }

  const statusAtual = usuario ? statusDoLivro(usuario, livro.id) : null;
  const jaEmLista = usuario && (statusAtual || usuario.livrosFav.includes(livro.id));
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
              <dd>{livro.publisher ?? "—"}</dd>
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

            {aviso && <p className="livro-aviso" role="alert">{aviso}</p>}

            {/* 8. Sinopse e Sobre o autor */}
            <section className="livro-caixa">
              <h2>Sinopse:</h2>
              <p>{livro.description || "Este livro ainda não tem sinopse."}</p>
            </section>

            <section className="livro-caixa">
              <h2>Sobre o autor:</h2>
              {sobreAutor.estado === "carregando" && <p>Carregando...</p>}
              {sobreAutor.estado === "vazio" && <p>Ainda não há informações sobre o autor.</p>}
              {sobreAutor.estado === "ok" && (
                <>
                  <p>{sobreAutor.texto}</p>
                  {sobreAutor.fonte && (
                    <p className="livro-fonte">
                      Fonte: <a href={sobreAutor.fonte} target="_blank" rel="noreferrer">Wikipédia</a>
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
