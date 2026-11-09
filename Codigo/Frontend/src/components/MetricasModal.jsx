import { useState } from "react";
import Modal from "./Modal";
import "./popUpCadastro.css";
import API_URL from "../services/api";

function FormularioLeitura({ fechar, aoSalvar }) {
  const [nome, setNome] = useState("");
  const [pagInicial, setPagInicial] = useState("");
  const [pagFinal, setPagFinal] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    if (enviando) return;
    if (Number(pagFinal) < Number(pagInicial)) {
      setErro("A última página precisa ser igual ou posterior à página inicial.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch(`${API_URL}/api/metricas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ nome: nome.trim(), pagInicial, pagFinal }),
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
          <input id="leitura-livro" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <label htmlFor="leitura-inicial">Página inicial</label>
          <input id="leitura-inicial" type="number" min="0" step="1" value={pagInicial} onChange={(e) => setPagInicial(e.target.value)} required />
          <label htmlFor="leitura-final">Última página lida</label>
          <input id="leitura-final" type="number" min={pagInicial || "0"} step="1" value={pagFinal} onChange={(e) => setPagFinal(e.target.value)} required />
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
