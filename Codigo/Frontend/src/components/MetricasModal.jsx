import { useState } from "react";
import Modal from "./Modal";
import "./popUpCadastro.css";
import "./contaForm.css";
import API_URL from "../services/api";
import { criarRegistroLeitura } from "../services/leituraUtils";

function FormularioLeitura({ fechar, aoSalvar, lendo = [], favoritos = [], lerDepois = [], usuarioId }) {
  const [livroId, setLivroId] = useState("");
  const [avaliacao, setAvaliacao] = useState(5);
  const [pagInicial, setPagInicial] = useState("");
  const [pagFinal, setPagFinal] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErro("");
    setEnviando(true);
    try {
      const registro = criarRegistroLeitura({ usuarioId, livroId, pagInicial, pagFinal, avaliacao });
      const resposta = await fetch(`${API_URL}/api/metricas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(registro),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível registrar a leitura.");
      if (aoSalvar) aoSalvar();
      else fechar();
    } catch (falha) {
      setErro(falha instanceof TypeError ? "Não foi possível conectar. Verifique sua conexão e tente novamente." : falha.message);
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo="Registrar leitura" classe="modal-conta" aoFechar={() => { if (!enviando) fechar(); }}>
      <form className="conta-form" onSubmit={salvar}>
        <p className="conta-intro">Conte até onde você leu hoje.</p>
        <fieldset disabled={enviando}>
          <label htmlFor="leitura-livro">Livro</label>
          <select id="leitura-livro" value={livroId} onChange={(e) => setLivroId(e.target.value)} required>
            <option value="">Selecione um livro</option>
            {[...new Map([...lendo, ...favoritos, ...lerDepois].map((livro) => [livro.id, livro])).values()].map((livro) => <option key={livro.id} value={livro.id}>{livro.title}</option>)}
          </select>
          <label htmlFor="leitura-inicial">Página inicial</label>
          <input id="leitura-inicial" type="number" min="0" step="1" value={pagInicial} onChange={(e) => setPagInicial(e.target.value)} required />
          <label htmlFor="leitura-final">Última página lida</label>
          <input id="leitura-final" type="number" min={Number(pagInicial || 0) + 1} step="1" value={pagFinal} onChange={(e) => setPagFinal(e.target.value)} required />
          <label htmlFor="leitura-nota">Avaliação da leitura</label>
          <select id="leitura-nota" value={avaliacao} onChange={(e) => setAvaliacao(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((nota) => <option key={nota} value={nota}>{nota} de 5</option>)}
          </select>
        </fieldset>
        {erro && <p className="conta-erro" role="alert">{erro}</p>}
        <button className="conta-principal" disabled={enviando}>{enviando ? "Registrando…" : "Registrar leitura"}</button>
      </form>
    </Modal>
  );
}

export default function MetricasModal({ aberto, ...props }) {
  return aberto ? <FormularioLeitura {...props} /> : null;
}
