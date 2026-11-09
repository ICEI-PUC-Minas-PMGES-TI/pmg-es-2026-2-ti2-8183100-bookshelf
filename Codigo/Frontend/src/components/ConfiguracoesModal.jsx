import { useState } from "react";
import { BookOpen, KeyRound, Moon, Sun, UserRound } from "lucide-react";
import Modal from "./Modal";
import { LIMITE_NOME, LIMITE_USUARIO, validarPerfil } from "../services/perfilService";
import { enviarConfiguracoes } from "../services/configuracoesService";
import { obterTema, salvarTema } from "../services/temaService";
import "./ConfiguracoesModal.css";

function Campo({ nome, rotulo, valor, aoMudar, erro, tipo = "text", ...props }) {
  const id = `config-${nome}`;
  return (
    <div className="config-campo">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} type={tipo} value={valor} onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={Boolean(erro)} aria-describedby={erro ? `${id}-erro` : undefined} {...props} />
      {erro && <p id={`${id}-erro`} className="config-erro" role="alert">{erro}</p>}
    </div>
  );
}

function PainelConfiguracoes({ usuario, aoAtualizar, aoFechar }) {
  const iniciais = { nome: usuario.nome ?? "", userName: usuario.userName ?? "", email: usuario.email ?? "" };
  const [salvos, setSalvos] = useState(iniciais);
  const [dados, setDados] = useState(iniciais);
  const [aba, setAba] = useState("conta");
  const [tema, setTema] = useState(obterTema);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [repeticao, setRepeticao] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [descartando, setDescartando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [erroGeral, setErroGeral] = useState("");

  const alterado = Object.keys(dados).some((chave) => dados[chave] !== salvos[chave]) || Boolean(novaSenha || repeticao);
  const alteraEmail = dados.email.trim() !== salvos.email;

  function fechar() {
    if (enviando) return;
    if (alterado) setDescartando(true);
    else aoFechar();
  }

  function mudarCampo(chave, valor) {
    setDados((atuais) => ({ ...atuais, [chave]: valor }));
    setErros((atuais) => ({ ...atuais, [chave]: "" }));
    setMensagem("");
  }

  function trocarAba(proxima) {
    setAba(proxima);
    setErroGeral("");
    setMensagem("");
    setExcluindo(false);
    setSenhaAtual("");
  }

  async function salvarConta(evento) {
    evento.preventDefault();
    const encontrados = validarPerfil({ ...dados, bio: "" });
    if (!/^[^\s@]+@[^\s@]+$/.test(dados.email.trim())) encontrados.email = "Informe um e-mail válido.";
    if (alteraEmail && !senhaAtual) encontrados.senhaAtual = "Informe sua senha atual para alterar o e-mail.";
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;
    setEnviando(true);
    setErroGeral("");
    setMensagem("");
    const novos = Object.fromEntries(Object.entries(dados).map(([chave, valor]) => [chave, valor.trim()]));
    try {
      await enviarConfiguracoes({ ...novos, ...(alteraEmail && { senhaAtual }) });
      setDados(novos);
      setSalvos(novos);
      setSenhaAtual("");
      aoAtualizar(novos);
      setMensagem("Alterações salvas.");
    } catch (erro) {
      setErroGeral(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  async function salvarSenha(evento) {
    evento.preventDefault();
    const encontrados = {};
    if (!senhaAtual) encontrados.senhaAtual = "Informe sua senha atual.";
    if (!novaSenha.trim()) encontrados.novaSenha = "Informe a nova senha.";
    if (novaSenha !== repeticao) encontrados.repeticao = "As senhas precisam ser iguais.";
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;
    setEnviando(true);
    setErroGeral("");
    setMensagem("");
    try {
      await enviarConfiguracoes({ senhaAtual, senha: novaSenha });
      setSenhaAtual("");
      setNovaSenha("");
      setRepeticao("");
      setMensagem("Senha alterada.");
    } catch (erro) {
      setErroGeral(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErroGeral("");
    try {
      await enviarConfiguracoes({ senhaAtual, confirmacao }, "DELETE");
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.assign("/login");
    } catch (erro) {
      setErroGeral(erro.message);
      setEnviando(false);
    }
  }

  return (
    <Modal aberto aoFechar={fechar} titulo="Configurações" classe="modal-configuracoes">
      {descartando ? (
        <section className="config-descarte" aria-labelledby="config-descarte-titulo">
          <h3 id="config-descarte-titulo">Descartar alterações?</h3>
          <p>Você tem alterações que ainda não foram salvas.</p>
          <div className="config-acoes">
            <button type="button" className="config-botao config-botao--secundario" onClick={() => setDescartando(false)}>Continuar editando</button>
            <button type="button" className="config-botao" onClick={aoFechar}>Descartar e fechar</button>
          </div>
        </section>
      ) : (
        <div className="config-layout">
          <nav className="config-nav" aria-label="Seções das configurações">
            <button type="button" aria-current={aba === "conta" ? "page" : undefined} onClick={() => trocarAba("conta")} disabled={enviando}><UserRound size={18} aria-hidden="true" />Conta</button>
            <button type="button" aria-current={aba === "aparencia" ? "page" : undefined} onClick={() => trocarAba("aparencia")} disabled={enviando}><BookOpen size={18} aria-hidden="true" />Aparência</button>
            <button type="button" aria-current={aba === "seguranca" ? "page" : undefined} onClick={() => trocarAba("seguranca")} disabled={enviando}><KeyRound size={18} aria-hidden="true" />Segurança</button>
          </nav>
          <div className="config-conteudo" aria-busy={enviando}>
            {aba === "conta" && (
              <form onSubmit={salvarConta} noValidate>
                <h3>Sua conta</h3>
                <p className="config-intro">Seu nome no BookMark e o e-mail que você usa para entrar.</p>
                <fieldset disabled={enviando}>
                  <Campo nome="nome" rotulo="Nome" valor={dados.nome} aoMudar={(v) => mudarCampo("nome", v)} erro={erros.nome} maxLength={LIMITE_NOME} autoComplete="name" required />
                  <Campo nome="userName" rotulo="Nome de usuário" valor={dados.userName} aoMudar={(v) => mudarCampo("userName", v)} erro={erros.userName} maxLength={LIMITE_USUARIO} autoComplete="username" autoCapitalize="none" spellCheck={false} required />
                  <Campo nome="email" rotulo="E-mail" tipo="email" valor={dados.email} aoMudar={(v) => mudarCampo("email", v)} erro={erros.email} autoComplete="email" required />
                  {alteraEmail && <Campo nome="senha-email" rotulo="Senha atual para confirmar o novo e-mail" tipo="password" valor={senhaAtual} aoMudar={setSenhaAtual} erro={erros.senhaAtual} autoComplete="current-password" required />}
                </fieldset>
                <div className="config-acoes"><button type="button" className="config-botao config-botao--secundario" onClick={fechar} disabled={enviando}>Fechar</button><button className="config-botao" disabled={enviando}>{enviando ? "Salvando…" : "Salvar alterações"}</button></div>
              </form>
            )}
            {aba === "aparencia" && (
              <section>
                <h3>Seu jeito de ler</h3>
                <p className="config-intro">Escolha a aparência do BookMark neste navegador.</p>
                <fieldset className="config-temas">
                  <legend>Tema da aplicação</legend>
                  <label className="config-tema">
                    <input type="radio" name="tema" value="claro" checked={tema === "claro"} onChange={() => { salvarTema("claro"); setTema("claro"); }} />
                    <Sun size={24} aria-hidden="true" /><span>Claro<small>Páginas claras, tons acolhedores.</small></span>
                  </label>
                  <label className="config-tema">
                    <input type="radio" name="tema" value="escuro" checked={tema === "escuro"} onChange={() => { salvarTema("escuro"); setTema("escuro"); }} />
                    <Moon size={24} aria-hidden="true" /><span>Escuro<small>Superfícies escuras, texto suave.</small></span>
                  </label>
                </fieldset>
                <p className="config-nota" role="status">A preferência é salva automaticamente neste navegador.</p>
              </section>
            )}
            {aba === "seguranca" && (
              <section>
                <h3>Segurança</h3>
                <p className="config-intro">Atualize sua senha de acesso.</p>
                {!excluindo && <form onSubmit={salvarSenha} noValidate>
                  <fieldset disabled={enviando}>
                    <Campo nome="senha-atual" rotulo="Senha atual" tipo="password" valor={senhaAtual} aoMudar={setSenhaAtual} erro={erros.senhaAtual} autoComplete="current-password" required />
                    <Campo nome="nova-senha" rotulo="Nova senha" tipo="password" valor={novaSenha} aoMudar={setNovaSenha} erro={erros.novaSenha} maxLength={128} autoComplete="new-password" required />
                    <Campo nome="repeticao" rotulo="Confirmar nova senha" tipo="password" valor={repeticao} aoMudar={setRepeticao} erro={erros.repeticao} maxLength={128} autoComplete="new-password" required />
                  </fieldset>
                  <div className="config-acoes"><button className="config-botao" disabled={enviando}>{enviando ? "Salvando…" : "Alterar senha"}</button></div>
                </form>}
                <div className="config-exclusao">
                  <h4>Excluir conta</h4>
                  <p>A exclusão é permanente. Seu perfil e os dados de leitura armazenados na conta serão removidos.</p>
                  {excluindo ? (
                    <form onSubmit={excluir}>
                      <fieldset disabled={enviando}>
                        <Campo nome="senha-excluir" rotulo="Senha atual" tipo="password" valor={senhaAtual} aoMudar={setSenhaAtual} autoComplete="current-password" required />
                        <Campo nome="confirmacao" rotulo="Digite EXCLUIR para confirmar" valor={confirmacao} aoMudar={setConfirmacao} autoComplete="off" required />
                      </fieldset>
                      <div className="config-acoes">
                        <button type="button" className="config-botao config-botao--secundario" onClick={() => { setExcluindo(false); setSenhaAtual(""); setConfirmacao(""); setErroGeral(""); }} disabled={enviando}>Cancelar</button>
                        <button className="config-botao config-botao--perigo" disabled={enviando || confirmacao !== "EXCLUIR" || !senhaAtual}>{enviando ? "Excluindo…" : "Excluir minha conta"}</button>
                      </div>
                    </form>
                  ) : <button type="button" className="config-link-perigo" disabled={enviando} onClick={() => { setExcluindo(true); setSenhaAtual(""); setMensagem(""); }}>Quero excluir minha conta</button>}
                </div>
              </section>
            )}
            {erroGeral && <p className="config-erro config-feedback" role="alert">{erroGeral}</p>}
            {mensagem && <p className="config-sucesso config-feedback" role="status">{mensagem}</p>}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function ConfiguracoesModal({ aberto, ...props }) {
  return aberto ? <PainelConfiguracoes {...props} /> : null;
}
