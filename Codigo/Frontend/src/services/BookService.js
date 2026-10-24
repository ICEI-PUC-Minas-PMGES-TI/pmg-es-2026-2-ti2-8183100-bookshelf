import mockBooks from "../mocks/JsonLivros.json";

// Trocar para false quando for usar api real (NÃO ESQUECE!!!)
const USE_MOCK = true;

const API_URL = "https://www.googleapis.com/books/v1/volumes";
const DEFAULT_QUERY = "subject:fiction"; // se tiver o campo vazio busca o initial

// Converte o formato do Google Books num objeto simples, formato que as telas conhecem. Campos ausentes viram null / [].

function normalize(item) {
  const info = item.volumeInfo ?? {};
  const thumb =
    info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;

  return {
    id: item.id,
    title: info.title ?? "Sem título",
    authors: info.authors ?? [],
    category: info.categories?.[0] ?? null,
    description: info.description ?? "",
    thumbnail: thumb ? thumb.replace(/^http:/, "https:") : null,
    rating: info.averageRating ?? null,
    year: info.publishedDate ? Number(info.publishedDate.slice(0, 4)) : null,
  };
}

export async function searchBooks(query = "") {
  const term = query.trim();

  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400)); // Pra fingir ter uma rede
    const t = term.toLowerCase();
    return mockBooks.items
      .map(normalize)
      .filter(
        (b) =>
          !t ||
          b.title.toLowerCase().includes(t) ||
          b.authors.join(" ").toLowerCase().includes(t),
      );
  }

  const q = term || DEFAULT_QUERY;
  const res = await fetch(
    `${API_URL}?q=${encodeURIComponent(q)}&maxResults=20`,
  );
  if (!res.ok) throw new Error(`A API respondeu com status ${res.status}`);
  const data = await res.json();
  return (data.items ?? []).map(normalize);
}
