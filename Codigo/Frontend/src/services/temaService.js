const CHAVE = "bookmark-tema";

export function obterTema() {
  const salvo = localStorage.getItem(CHAVE);
  return salvo === "escuro" ? "escuro" : "claro";
}

export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  document.documentElement.style.colorScheme = tema === "escuro" ? "dark" : "light";
}

export function salvarTema(tema) {
  localStorage.setItem(CHAVE, tema);
  aplicarTema(tema);
  window.dispatchEvent(new Event("tema-atualizado"));
}
