import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";
import CadastroModal from "../components/popUpCadastro";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cadastro, setCadastro] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function entrar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), senha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || "Não foi possível entrar. Tente novamente.");
      localStorage.setItem("token", dados.token);
      localStorage.setItem("usuario", JSON.stringify(dados.usuario));
      window.location.assign("/perfil");
    } catch (falha) {
      setErro(falha instanceof TypeError ? "Não foi possível conectar. Verifique sua conexão e tente novamente." : falha.message);
      setEnviando(false);
    }
  }

  return (
    <main className="login-container">
      <aside className="login-literatura">
        <blockquote>“Mesmo não sabendo que era amor, sentiam que era bom.”</blockquote>
        <p>Capitães de areia <span>Jorge Amado</span></p>
      </aside>
      <section className="login-conteudo" aria-labelledby="login-titulo">
        <h1 id="login-titulo">Volte para suas leituras.</h1>
        <p className="login-intro">Entre para acompanhar seus livros e continuar sua jornada.</p>
        <form className="conta-form" onSubmit={entrar}>
          <fieldset disabled={enviando}>
            <label htmlFor="login-email">E-mail</label>
            <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label htmlFor="login-senha">Senha</label>
            <input id="login-senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </fieldset>
          {erro && <p className="conta-erro" role="alert">{erro}</p>}
          {sucesso && <p className="conta-sucesso" role="status">{sucesso}</p>}
          <button className="conta-principal" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
        </form>
        <p className="login-cadastro">Sua primeira visita? <button onClick={() => setCadastro(true)}>Criar uma conta</button></p>
        <Link className="login-explorar" to="/catalogo">Explorar o catálogo</Link>
      </section>
      <CadastroModal aberto={cadastro} fechar={() => setCadastro(false)} aoCadastrar={(novoEmail) => {
        setEmail(novoEmail);
        setSucesso("Conta criada. Entre com seu e-mail e senha.");
        setErro("");
        setCadastro(false);
      }} />
    </main>
  );
}
