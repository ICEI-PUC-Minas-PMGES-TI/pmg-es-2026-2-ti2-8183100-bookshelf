import API_URL from "./api";

const ID_USUARIO = 1;

// Nomes dos campos do usuário que guardam cada lista.
export const LISTAS = [
  { chave: "livrosFav", titulo: "Favoritos" },
  { chave: "livrosLendo", titulo: "Lendo" },
  { chave: "livrosLerDepois", titulo: "Pretendo ler" },
  { chave: "livrosLidos", titulo: "Lidos" },
];

// Favoritos é uma lista à parte: o livro pode estar nela e em uma das listas de status.
export const LISTAS_STATUS = ["livrosLendo", "livrosLerDepois", "livrosLidos"];

// Garante que as listas e as notas existam, mesmo em usuários criados sem esses campos.
function normalizarUsuario(usuario) {
  return {
    ...usuario,
    livrosFav: usuario.livrosFav ?? [],
    livrosLendo: usuario.livrosLendo ?? [],
    livrosLerDepois: usuario.livrosLerDepois ?? [],
    livrosLidos: usuario.livrosLidos ?? [],
    avaliacoes: usuario.avaliacoes ?? {},
  };
}

// Os dados do usuário vêm do backend (MongoDB). O endereço fica em VITE_API_URL, no arquivo .env.
function urlDoUsuario() {
  if (!API_URL) throw new Error("O endereço da API (VITE_API_URL) não está configurado.");
  return `${API_URL}/api/usuarios/${ID_USUARIO}`;
}

export async function obterUsuario() {
  const resposta = await fetch(urlDoUsuario());
  if (resposta.status === 404) throw new Error("Usuário não encontrado.");
  if (!resposta.ok) throw new Error(`A API respondeu com status ${resposta.status}`);
  return normalizarUsuario(await resposta.json());
}

// Salva só o que esta parte do app altera (listas e notas), para não sobrescrever o resto do usuário.
export async function salvarUsuario(usuario) {
  const { livrosFav, livrosLendo, livrosLerDepois, livrosLidos, avaliacoes } = usuario;
  const resposta = await fetch(urlDoUsuario(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ livrosFav, livrosLendo, livrosLerDepois, livrosLidos, avaliacoes }),
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
