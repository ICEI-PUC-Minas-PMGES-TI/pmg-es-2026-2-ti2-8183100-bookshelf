import { useState } from "react";
import Modal from "./Modal";
import API_URL from "../services/api";
import { validarPerfil } from "../services/perfilService";
import "./popUpCadastro.css";
import "./contaForm.css";

function FormularioCadastro({ fechar, aoCadastrar }) {
  const [dados, setDados] = useState({ nome: "", userName: "", dataNascimento: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function cadastrar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const erros = validarPerfil({ ...dados, bio: "" });
    if (Object.keys(erros).length) {
      setErro(Object.values(erros)[0]);
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, nome: dados.nome.trim(), userName: dados.userName.trim(), email: dados.email.trim() }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro || "Não foi possível criar a conta. Tente novamente.");
      if (aoCadastrar) aoCadastrar(dados.email.trim());
      else setConcluido(true);
    } catch (falha) {
      setErro(falha instanceof TypeError ? "Não foi possível conectar. Verifique sua conexão e tente novamente." : falha.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo="Criar conta" classe="modal-conta" aoFechar={() => { if (!enviando) fechar(); }}>
      {concluido ? <p className="conta-sucesso" role="status">Conta criada. Você já pode entrar.</p> : (
        <form className="conta-form" onSubmit={cadastrar}>
          <p className="conta-intro">Um lugar para guardar seus livros e acompanhar suas leituras.</p>
          <fieldset disabled={enviando}>
            <label htmlFor="cadastro-nome">Nome completo</label>
            <input id="cadastro-nome" autoComplete="name" maxLength={60} value={dados.nome} onChange={(e) => setDados({ ...dados, nome: e.target.value })} required />
            <label htmlFor="cadastro-usuario">Nome de usuário</label>
            <input id="cadastro-usuario" autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={20} value={dados.userName} onChange={(e) => setDados({ ...dados, userName: e.target.value })} required />
            <label htmlFor="cadastro-nascimento">Data de nascimento</label>
            <input id="cadastro-nascimento" type="date" autoComplete="bday" max={new Date().toLocaleDateString("en-CA")} value={dados.dataNascimento} onChange={(e) => setDados({ ...dados, dataNascimento: e.target.value })} required />
            <label htmlFor="cadastro-email">E-mail</label>
            <input id="cadastro-email" type="email" autoComplete="email" value={dados.email} onChange={(e) => setDados({ ...dados, email: e.target.value })} required />
            <label htmlFor="cadastro-senha">Senha</label>
            <input id="cadastro-senha" type="password" autoComplete="new-password" maxLength={128} value={dados.senha} onChange={(e) => setDados({ ...dados, senha: e.target.value })} required />
          </fieldset>
          {erro && <p className="conta-erro" role="alert">{erro}</p>}
          <button className="conta-principal" disabled={enviando}>{enviando ? "Criando conta…" : "Criar conta"}</button>
        </form>
      )}
    </Modal>
  );
}

export default function CadastroModal({ aberto, ...props }) {
  return aberto ? <FormularioCadastro {...props} /> : null;
}
