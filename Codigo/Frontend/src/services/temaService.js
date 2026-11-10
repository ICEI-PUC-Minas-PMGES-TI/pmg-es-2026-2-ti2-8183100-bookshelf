const CHAVE = "bookmark-tema";

export function obterTema() {
  const salvo = localStorage.getItem(CHAVE);
  if (salvo === "claro" || salvo === "escuro") return salvo;
  return localStorage.getItem("bm-theme") === "dark" ? "escuro" : "claro";
}

export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  document.documentElement.dataset.theme = tema === "escuro" ? "dark" : "light";
  document.documentElement.style.colorScheme = tema === "escuro" ? "dark" : "light";
}

export function salvarTema(tema) {
  localStorage.setItem(CHAVE, tema);
  localStorage.setItem("bm-theme", tema === "escuro" ? "dark" : "light");
  aplicarTema(tema);
  window.dispatchEvent(new Event("tema-atualizado"));
}
