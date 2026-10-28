// "Sobre o autor": o Google Books não traz biografia, então o resumo vem da Wikipédia em português.
// Se não achar uma página confiável, devolve null e a tela mostra um texto padrão.

const URL_RESUMO = "https://pt.wikipedia.org/api/rest_v1/page/summary";
const URL_BUSCA = "https://pt.wikipedia.org/w/rest.php/v1/search/title";

const cache = new Map();

function semAcento(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

async function resumoDaPagina(titulo) {
  const resposta = await fetch(`${URL_RESUMO}/${encodeURIComponent(titulo.replace(/ /g, "_"))}`);
  if (!resposta.ok) return null;
  const dados = await resposta.json();
  // "standard" descarta páginas de desambiguação (nomes que servem a várias pessoas).
  if (dados.type !== "standard" || !dados.extract) return null;
  return {
    texto: dados.extract,
    fonte: dados.content_urls?.desktop?.page ?? null,
  };
}

async function buscarResumo(nome) {
  // 1) tenta o nome exatamente como o Google informa
  const direto = await resumoDaPagina(nome);
  if (direto) return direto;

  // 2) senão, procura o título mais parecido (ex.: "J.R.R. Tolkien" -> "J. R. R. Tolkien")
  const resposta = await fetch(`${URL_BUSCA}?q=${encodeURIComponent(nome)}&limit=1`);
  if (!resposta.ok) return null;
  const achado = (await resposta.json()).pages?.[0];
  if (!achado) return null;

  // só aceita se o sobrenome do autor aparece no título encontrado
  const sobrenome = semAcento(nome.trim().split(/\s+/).pop());
  if (!semAcento(achado.title).includes(sobrenome)) return null;
  return resumoDaPagina(achado.title);
}

// Retorna { texto, fonte } ou null.
export async function buscarSobreAutor(nome) {
  if (!nome) return null;
  if (cache.has(nome)) return cache.get(nome);

  let resultado;
  try {
    resultado = await buscarResumo(nome);
  } catch {
    resultado = null; // sem internet ou Wikipédia fora do ar: fica sem biografia
  }
  cache.set(nome, resultado);
  return resultado;
}
