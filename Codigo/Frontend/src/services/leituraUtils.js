// Datas de leitura são dias civis, sem conversão implícita para UTC.
export function formatarData(data) {
  if (!data) return null;
  if (typeof data === "string" && /^\d{4}-\d{2}-\d{2}/.test(data)) return data.substring(0, 10);
  const convertida = new Date(data);
  if (Number.isNaN(convertida.getTime())) return null;
  return `${convertida.getFullYear()}-${String(convertida.getMonth() + 1).padStart(2, "0")}-${String(convertida.getDate()).padStart(2, "0")}`;
}

export function obterDiasStreak(metricas) {
  const datas = [...new Set(metricas.map((metrica) => formatarData(metrica.dataLeitura)).filter(Boolean))].sort();
  const dias = new Set();
  const emUTC = (data) => { const [ano, mes, dia] = data.split("-").map(Number); return Date.UTC(ano, mes - 1, dia); };
  for (let i = 1; i < datas.length; i++) {
    if (emUTC(datas[i]) - emUTC(datas[i - 1]) === 86400000) {
      dias.add(datas[i - 1]);
      dias.add(datas[i]);
    }
  }
  return dias;
}

export function criarRegistroLeitura({ usuarioId, livroId, pagInicial, pagFinal, avaliacao }, hoje = new Date()) {
  if (!usuarioId) throw new Error("Sua sessão expirou. Entre novamente.");
  if (!livroId) throw new Error("Selecione um livro da sua biblioteca.");
  const inicio = Number(pagInicial);
  const fim = Number(pagFinal);
  if (pagInicial === "" || pagFinal === "" || !Number.isSafeInteger(inicio) || !Number.isSafeInteger(fim) || inicio < 0 || fim <= inicio) {
    throw new Error("Informe páginas inteiras e uma página final maior que a inicial.");
  }
  const nota = Number(avaliacao);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw new Error("Escolha uma avaliação entre 1 e 5.");
  return { usuarioId, livroId, pagInicial: inicio, pagFinal: fim, paginasLidas: fim - inicio, tempoLeituraMinutos: 0, avaliacao: nota, dataLeitura: formatarData(hoje) };
}
