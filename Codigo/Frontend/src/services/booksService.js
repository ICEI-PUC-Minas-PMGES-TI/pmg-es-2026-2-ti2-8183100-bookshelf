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

  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termoAtivo)}&maxResults=${maximoResultados}&key=AIzaSyBvSzeBpPw5k_e7gldsRbzEDqIuYeHmvBA`;

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

    // Mapeia o retorno da API para a estrutura exata que o BookCard.jsx utiliza.
    // NOTA: As chaves do objeto permanecem em inglês para manter a compatibilidade com as props do card.
    return itens.map((item) => {
      const info = item.volumeInfo || {};
      return {
        id: item.id,
        title: info.title || "Título indisponível",
        authors: info.authors || [],
        thumbnail:
          info.imageLinks?.thumbnail?.replace("http:", "https:") || null,
        category: info.categories ? info.categories[0] : null,
        rating: info.averageRating || null,
        year: info.publishedDate ? info.publishedDate.substring(0, 4) : null,
      };
    });
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
