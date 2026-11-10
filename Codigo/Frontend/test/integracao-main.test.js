import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { Buffer } from "node:buffer";
import { criarRegistroLeitura, formatarData, obterDiasStreak } from "../src/services/leituraUtils.js";

test("registro envia os campos numéricos esperados pela main, sem pedir tempo", () => {
  const registro = criarRegistroLeitura({ usuarioId: "usuario", livroId: "livro", pagInicial: "0", pagFinal: "1", avaliacao: 5 }, new Date(2026, 10, 9, 23, 55));
  assert.deepEqual(registro, { usuarioId: "usuario", livroId: "livro", pagInicial: 0, pagFinal: 1, paginasLidas: 1, tempoLeituraMinutos: 0, avaliacao: 5, dataLeitura: "2026-11-09" });
});

test("registro rejeita sessão ausente, livro ausente e páginas inválidas", () => {
  const base = { usuarioId: "usuario", livroId: "livro", pagInicial: "0", pagFinal: "10", avaliacao: 5 };
  for (const campos of [{ usuarioId: "" }, { livroId: "" }, { pagFinal: "0" }, { pagFinal: "-1" }, { pagFinal: "1.5" }, { pagInicial: "" }, { pagFinal: "abc" }, { avaliacao: 6 }]) {
    assert.throws(() => criarRegistroLeitura({ ...base, ...campos }));
  }
});

test("rota de métricas da main recebe o registro e incrementa páginas sem NaN", async () => {
  const fonte = await readFile(new URL("../../Backend/server.js", import.meta.url), "utf8");
  const inicio = fonte.indexOf('app.post("/api/metricas",');
  const fim = fonte.indexOf('app.put("/api/metricas/:id",', inicio);
  assert.ok(inicio >= 0 && fim > inicio);
  let handler;
  let inserido;
  let incremento;
  const db = { collection: (nome) => ({
    insertOne: async (registro) => { assert.equal(nome, "metricas"); inserido = registro; return { insertedId: "registro" }; },
    updateOne: async (filtro, atualizacao) => { assert.equal(nome, "usuarios"); assert.equal(filtro._id.valor, "usuario"); incremento = atualizacao.$inc; return { matchedCount: 1 }; },
  }) };
  runInNewContext(fonte.slice(inicio, fim), {
    app: { post: (_caminho, _autenticacao, fn) => { handler = fn; } },
    autenticarToken: () => {}, db, ObjectId: class { constructor(valor) { this.valor = valor; } }, console,
  });
  const body = criarRegistroLeitura({ usuarioId: "usuario", livroId: "livro", pagInicial: "3", pagFinal: "12", avaliacao: 4 });
  let status;
  const res = { status: (valor) => { status = valor; return res; }, json: () => {} };
  await handler({ body }, res);
  assert.equal(status, 201);
  assert.equal(inserido.livroId, "livro");
  assert.equal(inserido.dataLeitura, formatarData(new Date()));
  assert.equal(incremento.pagsLidas, 9);
  assert.equal(incremento.minLidos, 0);
  assert.equal(incremento.sequencia, 1);
});

test("calendário preserva datas locais, ignora duplicatas e reconhece dias consecutivos", () => {
  assert.equal(formatarData(new Date(2026, 10, 9, 23, 59)), "2026-11-09");
  assert.equal(formatarData("2026-11-09T00:00:00.000Z"), "2026-11-09");
  assert.equal(formatarData("inválida"), null);
  assert.deepEqual([...obterDiasStreak([
    { dataLeitura: "2026-10-31" }, { dataLeitura: "2026-11-01" }, { dataLeitura: "2026-11-01" }, { dataLeitura: "2026-11-04" }, {},
  ])], ["2026-10-31", "2026-11-01"]);
});

test("tema migra a preferência da main e sincroniza cabeçalho e configurações", async () => {
  const anterior = { localStorage: globalThis.localStorage, document: globalThis.document, window: globalThis.window };
  const dados = new Map([["bm-theme", "dark"]]);
  globalThis.localStorage = { getItem: (chave) => dados.get(chave) ?? null, setItem: (chave, valor) => dados.set(chave, valor) };
  globalThis.document = { documentElement: { dataset: {}, style: {} } };
  const eventos = [];
  globalThis.window = { dispatchEvent: (evento) => eventos.push(evento.type) };
  try {
    const { obterTema, salvarTema } = await import("../src/services/temaService.js");
    assert.equal(obterTema(), "escuro");
    salvarTema("claro");
    assert.equal(dados.get("bm-theme"), "light");
    assert.equal(dados.get("bookmark-tema"), "claro");
    assert.equal(document.documentElement.dataset.theme, "light");
    assert.equal(document.documentElement.dataset.tema, "claro");
    salvarTema("escuro");
    assert.equal(document.documentElement.dataset.theme, "dark");
    assert.equal(document.documentElement.dataset.tema, "escuro");
    assert.deepEqual(eventos, ["tema-atualizado", "tema-atualizado"]);
  } finally { Object.assign(globalThis, anterior); }
});

test("catálogo mantém 40 resultados, deslocamento, filtros e contrato antigo", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const navegadorOriginal = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { onLine: true } });
  const requisicoes = [];
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  globalThis.fetch = async (url) => {
    requisicoes.push(new URL(url));
    return { ok: true, json: async () => ({ totalItems: 120, items: Array.from({ length: 40 }, (_, id) => ({ id: String(id), volumeInfo: { title: `Livro ${id}` } })) }) };
  };
  try {
    const fonte = await readFile(new URL("../src/services/booksService.js", import.meta.url), "utf8");
    const fonteTeste = fonte.replace(/const CHAVE_API = "[^"]*";/, 'const CHAVE_API = "teste";');
    const servico = await import(`data:text/javascript;base64,${Buffer.from(fonteTeste).toString("base64")}`);
    const pagina1 = await servico.buscarPaginaLivros();
    const pagina2 = await servico.buscarPaginaLivros("leitura", { idioma: "pt", tipoPublicacao: "books" }, 2);
    assert.equal(pagina1.livros.length, 40);
    assert.equal(pagina2.temProxima, true);
    assert.equal(requisicoes[1].searchParams.get("maxResults"), "40");
    assert.equal(requisicoes[1].searchParams.get("startIndex"), "40");
    assert.equal(requisicoes[1].searchParams.get("langRestrict"), "pt");
    assert.equal(requisicoes[1].searchParams.get("printType"), "books");
    assert.equal(Array.isArray(await servico.buscarLivros()), true);
    assert.equal(requisicoes[0].searchParams.get("q"), requisicoes[2].searchParams.get("q"));
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ totalItems: 0 }) });
    assert.equal((await servico.buscarPaginaLivros("fim", {}, 4)).temProxima, false);
    await assert.rejects(() => servico.buscarPaginaLivros("", {}, 0));
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
    if (navegadorOriginal) Object.defineProperty(globalThis, "navigator", navegadorOriginal);
    else delete globalThis.navigator;
  }
});
