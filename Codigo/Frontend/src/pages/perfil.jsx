import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Settings, Pencil, LogOut, X } from "lucide-react";
import { buscarLivrosPorIds } from "../services/booksService";
import { LISTAS, LISTAS_STATUS, obterUsuario, salvarUsuario, adicionarNaLista, removerDaLista, statusDoLivro } from "../services/listasService";
import { FOTO_PADRAO, atualizarPerfil, avisarPerfilAtualizado } from "../services/perfilService";
import CapaLivro from "../components/CapaLivro";
import EditarPerfilModal from "../components/EditarPerfilModal";
import ConfiguracoesModal from "../components/ConfiguracoesModal";
import "./perfil.css";

const ABAS = ["livrosLendo", "livrosLerDepois", "livrosLidos", "livrosFav"]
  .map((chave) => LISTAS.find((lista) => lista.chave === chave));

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [livros, setLivros] = useState([]);
  const [listaAtiva, setListaAtiva] = useState("livrosLendo");
  const [listaAlvo, setListaAlvo] = useState(null);
  const [erro, setErro] = useState(false);
  const [aviso, setAviso] = useState("");
  const [editando, setEditando] = useState(false);
  const [configurando, setConfigurando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [salvandoLista, setSalvandoLista] = useState(false);
  const gravando = useRef(false);

  useEffect(() => {
    let cancelado = false;
    obterUsuario().then(async (dados) => {
      const ids = [...new Set(LISTAS.flatMap((lista) => dados[lista.chave]))];
      const encontrados = await buscarLivrosPorIds(ids);
      if (!cancelado) {
        setUsuario(dados);
        setLivros(encontrados);
      }
    }).catch(() => { if (!cancelado) setErro(true); });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    if (!sucesso) return;
    const temporizador = setTimeout(() => setSucesso(""), 4000);
    return () => clearTimeout(temporizador);
  }, [sucesso]);

  async function atualizar(novoUsuario) {
    if (gravando.current) return;
    gravando.current = true;
    setSalvandoLista(true);
    const anterior = usuario;
    setUsuario(novoUsuario);
    setAviso("");
    try {
      await salvarUsuario(novoUsuario);
    } catch {
      setUsuario(anterior);
      setAviso("Não foi possível salvar a alteração. Tente novamente.");
    } finally {
      gravando.current = false;
      setSalvandoLista(false);
    }
  }

  async function salvarEdicaoDoPerfil({ nome, userName, bio, foto }) {
    await atualizarPerfil({ nome, userName, bio, foto });
    setUsuario((atual) => ({
      ...atual,
      nome: nome.trim(),
      userName: userName.trim(),
      perfil: { ...atual.perfil, bio: bio.trim(), foto },
    }));
    avisarPerfilAtualizado(foto);
    setEditando(false);
    setSucesso("Perfil atualizado com sucesso!");
  }

  function navegarAbas(evento, indice) {
    const teclas = {
      ArrowRight: (indice + 1) % ABAS.length,
      ArrowLeft: (indice + ABAS.length - 1) % ABAS.length,
      Home: 0,
      End: ABAS.length - 1,
    };
    const proxima = teclas[evento.key];
    if (proxima === undefined) return;
    evento.preventDefault();
    setListaAtiva(ABAS[proxima].chave);
    document.getElementById(`aba-${ABAS[proxima].chave}`).focus();
  }

  function soltar(evento, destino) {
    evento.preventDefault();
    setListaAlvo(null);
    if (gravando.current) return;
    let dados;
    try {
      dados = JSON.parse(evento.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }
    if (!LISTAS_STATUS.includes(dados.origem) || !usuario[dados.origem].includes(dados.livroId)) return;
    if (dados.origem === destino) return;
    atualizar(adicionarNaLista(usuario, dados.livroId, destino));
  }

  function mudarStatus(livroId, destino) {
    const atual = statusDoLivro(usuario, livroId);
    if (atual === destino || (!atual && !destino)) return;
    atualizar(destino ? adicionarNaLista(usuario, livroId, destino) : removerDaLista(usuario, livroId, atual));
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.assign("/login");
  }

  if (erro) return <main className="perfil-page"><p role="alert">Não foi possível carregar o perfil. Verifique sua conexão e recarregue a página.</p></main>;
  if (!usuario) return <main className="perfil-page" aria-busy="true"><p>Carregando sua biblioteca…</p></main>;

  return (
    <main className="perfil-page">
      <div className="perfil-moldura"><div className="perfil-layout">
      <header className="perfil-menu">
        <img className="perfil-foto" src={usuario.perfil?.foto || FOTO_PADRAO} alt="Foto de perfil"
          onError={(e) => { if (e.currentTarget.src !== FOTO_PADRAO) e.currentTarget.src = FOTO_PADRAO; }} />
        <div className="perfil-identidade">
          <h1>{usuario.nome || usuario.userName}</h1>
          <p className="perfil-usuario">@{usuario.userName}</p>
          {usuario.perfil?.bio && <p className="perfil-bio">{usuario.perfil.bio}</p>}
          <p className="perfil-seguidores"><strong>{usuario.seguidores ?? 0}</strong> seguidores <span aria-hidden="true">·</span> <strong>{usuario.seguindo ?? 0}</strong> seguindo</p>
        </div>
        <nav className="perfil-botoes" aria-label="Ações do perfil">
          <button className="perfil-botao" onClick={() => setEditando(true)}><Pencil size={16} aria-hidden="true" />Editar perfil</button>
          <button className="perfil-botao" onClick={() => setConfigurando(true)}><Settings size={16} aria-hidden="true" />Configurações</button>
          <button className="perfil-sair" onClick={logout}><LogOut size={16} aria-hidden="true" />Sair</button>
        </nav>
      </header>

      <section className="perfil-biblioteca" aria-labelledby="biblioteca-titulo">
        <div className="perfil-biblioteca-topo"><h2 id="biblioteca-titulo">Minha biblioteca</h2><Link to="/catalogo">Explorar catálogo</Link></div>
        {sucesso && <p className="perfil-sucesso" role="status">{sucesso}</p>}
        {aviso && <p className="perfil-aviso" role="alert">{aviso}</p>}
        <div className="perfil-abas" role="tablist" aria-label="Listas de leitura">
          {ABAS.map((lista, indice) => (
            <button type="button" role="tab" key={lista.chave} id={`aba-${lista.chave}`}
              aria-selected={listaAtiva === lista.chave} aria-controls={`painel-${lista.chave}`} tabIndex={listaAtiva === lista.chave ? 0 : -1}
              className={listaAlvo === lista.chave ? "is-alvo" : ""}
              onClick={() => setListaAtiva(lista.chave)} onKeyDown={(e) => navegarAbas(e, indice)}
              onDragOver={(e) => { e.preventDefault(); setListaAlvo(lista.chave); }}
              onDragLeave={() => setListaAlvo(null)} onDrop={(e) => soltar(e, lista.chave)}>
              {lista.titulo}<span>{usuario[lista.chave].length}</span>
            </button>
          ))}
        </div>
        {ABAS.map((lista) => {
          const itens = usuario[lista.chave].map((id) => livros.find((livro) => livro.id === id)).filter(Boolean);
          return (
            <div role="tabpanel" id={`painel-${lista.chave}`} aria-labelledby={`aba-${lista.chave}`} key={lista.chave}
              hidden={listaAtiva !== lista.chave} tabIndex={0} aria-busy={salvandoLista}>
              {itens.length === 0 ? (
                <div className="perfil-vazio"><h3>{lista.chave === "livrosLendo" ? "Sua próxima leitura começa aqui" : "Nenhum livro nesta lista"}</h3><p>Encontre um livro no catálogo e adicione à sua biblioteca.</p><Link className="perfil-botao perfil-botao--principal" to="/catalogo">Encontrar um livro</Link></div>
              ) : (
                <div className="perfil-grade">
                  {itens.map((livro) => (
                    <article className="perfil-livro" key={livro.id} draggable={!salvandoLista && lista.chave !== "livrosFav"}
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", JSON.stringify({ livroId: livro.id, origem: lista.chave })); e.dataTransfer.effectAllowed = "move"; }}>
                      <Link to={`/livro/${livro.id}`} className="perfil-livro__link" draggable="false" title={livro.title}><CapaLivro livro={livro} /><h3>{livro.title}</h3></Link>
                      <p>{livro.authors?.join(", ") || "Autor desconhecido"}</p>
                      <div className="perfil-livro__acoes">
                        <button type="button" aria-label={`Favoritar ${livro.title}`} aria-pressed={usuario.livrosFav.includes(livro.id)} disabled={salvandoLista}
                          onClick={() => atualizar(usuario.livrosFav.includes(livro.id) ? removerDaLista(usuario, livro.id, "livrosFav") : adicionarNaLista(usuario, livro.id, "livrosFav"))}>
                          <Heart size={18} fill={usuario.livrosFav.includes(livro.id) ? "currentColor" : "none"} aria-hidden="true" />
                        </button>
                        <select aria-label={`Lista de leitura de ${livro.title}`} value={statusDoLivro(usuario, livro.id) ?? ""} disabled={salvandoLista} onChange={(e) => mudarStatus(livro.id, e.target.value)}>
                          <option value="">Sem lista</option>
                          {ABAS.filter((aba) => aba.chave !== "livrosFav").map((aba) => <option key={aba.chave} value={aba.chave}>{aba.titulo}</option>)}
                        </select>
                        {lista.chave !== "livrosFav" && <button type="button" aria-label={`Remover ${livro.title} da lista ${lista.titulo}`} disabled={salvandoLista} onClick={() => atualizar(removerDaLista(usuario, livro.id, lista.chave))}><X size={16} aria-hidden="true" /></button>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {salvandoLista && <p className="perfil-salvando" role="status">Salvando biblioteca…</p>}
      </section>
      </div></div>
      <EditarPerfilModal aberto={editando} usuario={usuario} aoSalvar={salvarEdicaoDoPerfil} aoFechar={() => setEditando(false)} />
      <ConfiguracoesModal aberto={configurando} usuario={usuario} aoAtualizar={(dados) => setUsuario((atual) => ({ ...atual, ...dados }))} aoFechar={() => setConfigurando(false)} />
    </main>
  );
}
