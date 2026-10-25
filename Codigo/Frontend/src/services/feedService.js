
import publicacoesMock from "../mocks/jsonPublicacoes.json";

const CHAVE_STORAGE = "bookmark_publicacoes";

export function obterPublicacoes() {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    // Se já existem dados salvos, utiliza esses dados.
    if (dadosSalvos !== null) {
      return JSON.parse(dadosSalvos);
    }

    // Na primeira visita, utiliza o JSON mock.
    localStorage.setItem(
      CHAVE_STORAGE,
      JSON.stringify(publicacoesMock)
    );

    return publicacoesMock;
  } catch (erro) {
    console.error("Erro ao carregar publicações:", erro);
    return publicacoesMock;
  }
}

export function salvarPublicacoes(publicacoes) {
  try {
    localStorage.setItem(
      CHAVE_STORAGE,
      JSON.stringify(publicacoes)
    );
  } catch (erro) {
    console.error("Erro ao salvar publicações:", erro);
  }
}
