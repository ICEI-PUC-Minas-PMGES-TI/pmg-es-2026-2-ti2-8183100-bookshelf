import { useRef, useState } from "react";
import Modal from "./Modal";
import {
  FOTO_PADRAO,
  LIMITE_NOME,
  LIMITE_USUARIO,
  LIMITE_BIO,
  validarPerfil,
  validarArquivoDeFoto,
  prepararFoto,
} from "../services/perfilService";
import "./EditarPerfilModal.css";

// Formulário que fica dentro do popup. Ele só existe enquanto o popup está aberto,
// por isso os campos voltam aos valores salvos toda vez que o popup é aberto de novo.
function FormularioPerfil({ usuario, aoSalvar, aoFechar }) {
  const [nome, setNome] = useState(usuario.nome ?? "");
  const [userName, setUserName] = useState(usuario.userName ?? "");
  const [bio, setBio] = useState(usuario.perfil?.bio ?? "");
  const [foto, setFoto] = useState(usuario.perfil?.foto ?? "");

  const [erros, setErros] = useState({}); // um erro por campo: nome, userName, bio, foto
  const [erroGeral, setErroGeral] = useState(""); // erro que não é de um campo (ex.: sem internet)
  const [lendoFoto, setLendoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const campoArquivo = useRef(null);

  // Quando a pessoa volta a digitar num campo, o erro dele some.
  function limparErro(campo) {
    setErros((atuais) => ({ ...atuais, [campo]: "" }));
  }

  async function escolherFoto(evento) {
    const arquivo = evento.target.files[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!arquivo) return;

    const erroDoArquivo = validarArquivoDeFoto(arquivo);
    if (erroDoArquivo) {
      setErros((atuais) => ({ ...atuais, foto: erroDoArquivo }));
      return;
    }

    setLendoFoto(true);
    try {
      setFoto(await prepararFoto(arquivo));
      setErros((atuais) => ({ ...atuais, foto: "" }));
    } catch (erro) {
      setErros((atuais) => ({ ...atuais, foto: erro.message }));
    } finally {
      setLendoFoto(false);
    }
  }

  function removerFoto() {
    setFoto("");
    setErros((atuais) => ({ ...atuais, foto: "" }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral("");

    const errosEncontrados = validarPerfil({ nome, userName, bio });
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setEnviando(true);
    try {
      await aoSalvar({ nome, userName, bio, foto });
    } catch (erro) {
      // 409 = nome de usuário já usado: mostra embaixo do campo certo
      if (erro.status === 409) {
        setErros({ userName: erro.message });
      } else {
        setErroGeral(erro.message);
      }
      setEnviando(false);
    }
    // Se deu certo, quem chamou fecha o popup.
  }

  const bloqueado = enviando || lendoFoto;

  return (
    <form className="editar" onSubmit={enviar} noValidate>
      {/* Foto de perfil */}
      <div className="editar__foto">
        <img
          className="editar__foto-previa"
          src={foto || FOTO_PADRAO}
          alt="Prévia da foto de perfil"
          onError={(e) => {
            if (e.currentTarget.src !== FOTO_PADRAO) e.currentTarget.src = FOTO_PADRAO;
          }}
        />

        <div className="editar__foto-acoes">
          <input
            ref={campoArquivo}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={escolherFoto}
            hidden
          />
          <button
            type="button"
            className="editar__botao"
            onClick={() => campoArquivo.current.click()}
            disabled={bloqueado}
          >
            {lendoFoto ? "Carregando..." : "Escolher foto"}
          </button>
          {foto && (
            <button type="button" className="editar__botao editar__botao--claro" onClick={removerFoto} disabled={bloqueado}>
              Remover foto
            </button>
          )}
          <p className="editar__dica">JPG, PNG ou WebP, até 5 MB.</p>
          {erros.foto && <p className="editar__erro" role="alert">{erros.foto}</p>}
        </div>
      </div>

      {/* Nome */}
      <label className="editar__rotulo" htmlFor="editar-nome">Nome</label>
      <input
        id="editar-nome"
        className={`editar__campo ${erros.nome ? "tem-erro" : ""}`}
        type="text"
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          limparErro("nome");
        }}
        maxLength={LIMITE_NOME}
        aria-invalid={Boolean(erros.nome)}
        aria-describedby={erros.nome ? "editar-nome-erro" : undefined}
      />
      {erros.nome && <p id="editar-nome-erro" className="editar__erro" role="alert">{erros.nome}</p>}

      {/* Nome de usuário */}
      <label className="editar__rotulo" htmlFor="editar-usuario">Nome de usuário</label>
      <input
        id="editar-usuario"
        className={`editar__campo ${erros.userName ? "tem-erro" : ""}`}
        type="text"
        value={userName}
        onChange={(e) => {
          setUserName(e.target.value);
          limparErro("userName");
        }}
        maxLength={LIMITE_USUARIO}
        autoCapitalize="none"
        aria-invalid={Boolean(erros.userName)}
        aria-describedby={erros.userName ? "editar-usuario-erro" : undefined}
      />
      {erros.userName && <p id="editar-usuario-erro" className="editar__erro" role="alert">{erros.userName}</p>}

      {/* Descrição */}
      <label className="editar__rotulo" htmlFor="editar-bio">Descrição</label>
      <textarea
        id="editar-bio"
        className={`editar__campo editar__campo--area ${erros.bio ? "tem-erro" : ""}`}
        value={bio}
        onChange={(e) => {
          setBio(e.target.value);
          limparErro("bio");
        }}
        maxLength={LIMITE_BIO}
        rows={4}
        placeholder="Conte um pouco sobre as suas leituras."
        aria-invalid={Boolean(erros.bio)}
        aria-describedby="editar-bio-contador"
      />
      <p id="editar-bio-contador" className="editar__contador">{bio.length}/{LIMITE_BIO}</p>
      {erros.bio && <p className="editar__erro" role="alert">{erros.bio}</p>}

      {erroGeral && <p className="editar__erro editar__erro--geral" role="alert">{erroGeral}</p>}

      <div className="editar__acoes">
        <button type="button" className="editar__botao editar__botao--claro" onClick={aoFechar} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" className="editar__botao" disabled={bloqueado}>
          {enviando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

// Popup de edição de perfil.
// aoSalvar({ nome, userName, bio, foto }) deve devolver uma Promise: se der erro, o popup
// continua aberto e mostra a mensagem; se der certo, quem chamou fecha o popup.
export default function EditarPerfilModal({ aberto, usuario, aoSalvar, aoFechar }) {
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Editar perfil">
      {aberto && <FormularioPerfil usuario={usuario} aoSalvar={aoSalvar} aoFechar={aoFechar} />}
    </Modal>
  );
}
