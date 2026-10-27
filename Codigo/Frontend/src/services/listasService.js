import usuarioMock from "../mocks/jsonUsuario.json";

// Trocar para false quando for usar o backend (precisa do MongoDB e do server.js rodando)
const USAR_MOCK = true;

const API_URL = "http://localhost:3001/api/usuarios";
const ID_USUARIO = 1;
const CHAVE_STORAGE = "bookmark_usuario";

// Nomes dos campos do usuário que guardam cada lista.
export const LISTAS = [
  { chave: "livrosFav", titulo: "Favoritos" },
  { chave: "livrosLendo", titulo: "Lendo" },
  { chave: "livrosLerDepois", titulo: "Pretendo ler" },
  { chave: "livrosLidos", titulo: "Lidos" },
];

// Favoritos é uma lista à parte: o livro pode estar nela e em uma das listas de status.
export const LISTAS_STATUS = ["livrosLendo", "livrosLerDepois", "livrosLidos"];

export async function obterUsuario() {
  if (USAR_MOCK) {
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo !== null) return JSON.parse(salvo);
    } catch (erro) {
      console.error("Erro ao ler o usuário salvo:", erro);
    }
    return usuarioMock.usuario;
  }

  const resposta = await fetch(`${API_URL}/${ID_USUARIO}`);
  if (!resposta.ok) throw new Error(`A API respondeu com status ${resposta.status}`);
  return resposta.json();
}

export async function salvarUsuario(usuario) {
  if (USAR_MOCK) {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuario));
    } catch (erro) {
      console.error("Erro ao salvar o usuário:", erro);
    }
    return;
  }

  const resposta = await fetch(`${API_URL}/${ID_USUARIO}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!resposta.ok) throw new Error(`A API respondeu com status ${resposta.status}`);
}

// Retorna a lista de status (lendo, ler depois, lidos) onde o livro está, ou null.
export function statusDoLivro(usuario, livroId) {
  return LISTAS_STATUS.find((chave) => usuario[chave].includes(livroId)) ?? null;
}

// Coloca o livro na lista. Nas listas de status ele sai das outras; Favoritos não mexe nas demais.
// Retorna um novo objeto (não altera o original).
export function adicionarNaLista(usuario, livroId, chave) {
  const novo = { ...usuario };

  if (chave === "livrosFav") {
    if (!novo.livrosFav.includes(livroId)) novo.livrosFav = [...novo.livrosFav, livroId];
    return novo;
  }

  LISTAS_STATUS.forEach((c) => {
    novo[c] = novo[c].filter((id) => id !== livroId);
  });
  novo[chave] = [...novo[chave], livroId];
  return novo;
}

export function removerDaLista(usuario, livroId, chave) {
  return { ...usuario, [chave]: usuario[chave].filter((id) => id !== livroId) };
}

// Nota (1 a 5) que o usuário deu ao livro, ou null se ainda não avaliou.
export function notaDoLivro(usuario, livroId) {
  return usuario.avaliacoes?.[livroId] ?? null;
}

// Salva a nota do usuário. Nota null remove a avaliação.
export function definirNota(usuario, livroId, nota) {
  const avaliacoes = { ...(usuario.avaliacoes ?? {}) };
  if (nota == null) {
    delete avaliacoes[livroId];
  } else {
    avaliacoes[livroId] = nota;
  }
  return { ...usuario, avaliacoes };
}
