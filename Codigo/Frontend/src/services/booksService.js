// Exceções personalizadas para lidar com erros de forma mais amigável
export class ErroRede extends Error {
  constructor(
    mensagem = "Parece que você está sem internet. Verifique sua conexão e tente novamente.",
  ) {
    super(mensagem);
    this.name = "ErroRede";
  }
}

export class ErroLimiteApi extends Error {
  constructor(
    mensagem = "Muitas buscas recentes. Aguarde um momento para o sistema respirar.",
  ) {
    super(mensagem);
    this.name = "ErroLimiteApi";
  }
}

export class ErroLivroNaoEncontrado extends Error {
  constructor(mensagem = "Não encontramos esse livro.") {
    super(mensagem);
    this.name = "ErroLivroNaoEncontrado";
  }
}

const URL_BASE = "https://www.googleapis.com/books/v1/volumes";
const CHAVE_API = "AIzaSyBvSzeBpPw5k_e7gldsRbzEDqIuYeHmvBA";

// ---------- cache dos livros já vistos ----------
// Cada livro que chega da API é guardado no navegador. Assim o Perfil e a página do livro
// abrem na hora, gastam menos da cota do Google e continuam mostrando os livros
// mesmo se a API falhar ou a internet cair.
const CHAVE_CACHE = "bookmark_livros";
const LIMITE_CACHE = 300;

function lerCache() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CACHE)) ?? {};
  } catch {
    return {};
  }
}

function guardarNoCache(livros) {
  try {
    const cache = lerCache();
    livros.forEach((livro) => {
      delete cache[livro.id]; // reinsere no fim, para os mais antigos saírem primeiro
      cache[livro.id] = livro;
    });
    const ids = Object.keys(cache);
    ids.slice(0, Math.max(0, ids.length - LIMITE_CACHE)).forEach((id) => delete cache[id]);
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(cache));
  } catch (erro) {
    console.error("Erro ao guardar os livros no cache:", erro);
  }
}

// Converte um volume do Google Books
// no objeto simples que as telas conhecem. Campos ausentes viram null / [] / "".
function normalizarLivro(item) {
  const info = item.volumeInfo || {};
  return {
    id: item.id,
    title: info.title || "Título indisponível",
    authors: info.authors || [],
    thumbnail: info.imageLinks?.thumbnail?.replace("http:", "https:") || null,
    category: info.categories ? info.categories[0] : null,
    rating: info.averageRating || null,
    year: info.publishedDate ? info.publishedDate.substring(0, 4) : null,
    // A sinopse do Google vem com tags HTML (<p>, <b>...): aqui viram texto simples.
    description: (info.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    publisher: info.publisher || null,
  };
}

// Termos amplos para garantir uma vitrine inicial relevante quando a busca estiver vazia
const VITRINE_PADRAO = [
  "subject:fiction",
  "Machado de Assis",
  "J.R.R. Tolkien",
  "George Orwell",
  "Clarice Lispector",
];

export async function buscarLivros(termoBusca = "", filtros = {}) {
  // Verificação preventiva de conexão offline
  if (!navigator.onLine) {
    throw new ErroRede();
  }

  const buscaVazia = termoBusca.trim() === "";

  // Se não houver termo, sorteia um autor/gênero da vitrine
  const termoAtivo = buscaVazia
    ? VITRINE_PADRAO[Math.floor(Math.random() * VITRINE_PADRAO.length)]
    : termoBusca;

  // 20 resultados para a vitrine aleatória, 12 para buscas específicas
  const maximoResultados = buscaVazia ? 20 : 12;

  let url = `${URL_BASE}?q=${encodeURIComponent(termoAtivo)}&maxResults=${maximoResultados}&key=${CHAVE_API}`;

  // Aplicação dos filtros do controle de pesquisa
  if (filtros.idioma) url += `&langRestrict=${filtros.idioma}`;
  if (filtros.tipoPublicacao && filtros.tipoPublicacao !== "all")
    url += `&printType=${filtros.tipoPublicacao}`;

  try {
    const resposta = await fetch(url);

    // Status 429 (Too Many Requests) ou 403 (Forbidden por limite de cota)
    if (resposta.status === 429 || resposta.status === 403) {
      throw new ErroLimiteApi();
    }

    if (!resposta.ok) {
      throw new Error(
        "Não conseguimos carregar o catálogo agora. Que tal tentar de novo?",
      );
    }

    const dados = await resposta.json();
    const itens = dados.items || [];

    // Mapeia o retorno da API para a estrutura que o BookCard.jsx utiliza.
    // NOTA: As chaves do objeto permanecem em inglês para manter a compatibilidade com as props do card.
    const livros = itens.map(normalizarLivro);
    guardarNoCache(livros);
    return livros;
  } catch (erro) {
    // Repassa os erros personalizados ou mascara erros genéricos com uma mensagem amigável
    if (erro instanceof ErroRede || erro instanceof ErroLimiteApi) {
      throw erro;
    }
    throw new Error(
      erro.message ||
        "Encontramos um obstáculo inesperado. Tente novamente em breve.",
    );
  }
}


// Pedidos em andamento, para não buscar o mesmo livro duas vezes ao mesmo tempo.
const pedidosEmAndamento = new Map();

// Busca um único livro pelo id (usada pela página do livro e pelo Perfil).
// Ordem: cache do navegador -> API do Google Books.
export function buscarLivroPorId(id) {
  const doCache = lerCache()[id];
  if (doCache) return Promise.resolve(doCache);

  if (!pedidosEmAndamento.has(id)) {
    const pedido = buscarNaApi(id).finally(() => pedidosEmAndamento.delete(id));
    pedidosEmAndamento.set(id, pedido);
  }
  return pedidosEmAndamento.get(id);
}

async function buscarNaApi(id) {
  if (!navigator.onLine) {
    throw new ErroRede();
  }

  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}/${encodeURIComponent(id)}?key=${CHAVE_API}`);
  } catch {
    throw new ErroRede();
  }

  if (resposta.status === 429 || resposta.status === 403) throw new ErroLimiteApi();
  if (resposta.status === 404) throw new ErroLivroNaoEncontrado();
  if (!resposta.ok) {
    throw new Error("Não conseguimos carregar o livro agora. Que tal tentar de novo?");
  }

  const livro = normalizarLivro(await resposta.json());
  guardarNoCache([livro]);
  return livro;
}

// Busca vários livros de uma vez (usada pelas listas do Perfil).
// Um livro que falhar não derruba os outros: ele só não aparece no resultado.
export async function buscarLivrosPorIds(ids) {
  const unicos = [...new Set(ids)];
  const encontrados = await Promise.all(unicos.map((id) => buscarLivroPorId(id).catch(() => null)));
  return encontrados.filter(Boolean);
}
