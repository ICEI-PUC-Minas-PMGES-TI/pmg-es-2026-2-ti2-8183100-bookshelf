import { urlDoUsuario } from "./listasService";

// Foto usada quando o usuário não tem foto (ou a foto não carrega).
export const FOTO_PADRAO = "https://www.gravatar.com/avatar/?d=mp&s=300";

// Limites da edição de perfil (os mesmos do backend, em validacoes.js).
export const LIMITE_NOME = 60;
export const LIMITE_USUARIO = 20;
export const LIMITE_BIO = 200;

const FORMATOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_ARQUIVO = 5 * 1024 * 1024; // 5 MB
const LADO_DA_FOTO = 256; // a foto é reduzida para 256 x 256 pixels

// Confere os campos do formulário. Devolve um objeto com uma mensagem por campo com erro
// (objeto vazio quer dizer que está tudo certo).
export function validarPerfil({ nome, userName, bio }) {
  const erros = {};

  if (!nome.trim()) {
    erros.nome = "O nome é obrigatório.";
  } else if (nome.trim().length > LIMITE_NOME) {
    erros.nome = `O nome pode ter no máximo ${LIMITE_NOME} caracteres.`;
  }

  const usuario = userName.trim();
  if (usuario.length < 3) {
    erros.userName = "O nome de usuário precisa ter pelo menos 3 caracteres.";
  } else if (usuario.length > LIMITE_USUARIO) {
    erros.userName = `O nome de usuário pode ter no máximo ${LIMITE_USUARIO} caracteres.`;
  } else if (!/^[A-Za-z0-9_.]+$/.test(usuario)) {
    erros.userName = "Use só letras, números, ponto e _ (sem espaços).";
  }

  if (bio.length > LIMITE_BIO) {
    erros.bio = `A descrição pode ter no máximo ${LIMITE_BIO} caracteres.`;
  }

  return erros;
}

// Confere o arquivo escolhido. Devolve uma mensagem de erro ou null.
export function validarArquivoDeFoto(arquivo) {
  if (!FORMATOS_FOTO.includes(arquivo.type)) return "Escolha uma imagem JPG, PNG ou WebP.";
  if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) return "A imagem é muito grande (máximo de 5 MB).";
  return null;
}

// Lê a imagem escolhida, recorta o centro em quadrado, reduz e devolve como texto (data URL).
// Assim a foto fica pequena (poucas dezenas de KB) e cabe no banco junto com os outros dados.
export function prepararFoto(arquivo) {
  return new Promise((resolver, rejeitar) => {
    const endereco = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.onload = () => {
      URL.revokeObjectURL(endereco);

      const lado = Math.min(imagem.width, imagem.height);
      const origemX = (imagem.width - lado) / 2;
      const origemY = (imagem.height - lado) / 2;

      const tela = document.createElement("canvas");
      tela.width = LADO_DA_FOTO;
      tela.height = LADO_DA_FOTO;

      const desenho = tela.getContext("2d");
      desenho.fillStyle = "#ffffff"; // fundo para PNGs com transparência
      desenho.fillRect(0, 0, LADO_DA_FOTO, LADO_DA_FOTO);
      desenho.drawImage(imagem, origemX, origemY, lado, lado, 0, 0, LADO_DA_FOTO, LADO_DA_FOTO);

      resolver(tela.toDataURL("image/jpeg", 0.85));
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(endereco);
      rejeitar(new Error("Não foi possível ler essa imagem. Tente outra."));
    };

    imagem.src = endereco;
  });
}

// Envia o perfil editado para o backend (com o token do login). Em caso de erro, lança uma
// Error com a mensagem que o servidor mandou (ex.: "Nome de usuário já está em uso.").
export async function atualizarPerfil({ nome, userName, bio, foto }) {
  const token = localStorage.getItem("token");

  let resposta;
  try {
    resposta = await fetch(urlDoUsuario(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome: nome.trim(),
        userName: userName.trim(),
        perfil: { bio: bio.trim(), foto },
      }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.");
  }

  // 401/403: o token do login expirou ou é inválido
  if (resposta.status === 401 || resposta.status === 403) {
    const erro = new Error("Sua sessão expirou. Entre novamente para editar o perfil.");
    erro.status = resposta.status;
    throw erro;
  }

  if (!resposta.ok) {
    let mensagem = "Não foi possível salvar o perfil. Tente de novo.";
    try {
      const corpo = await resposta.json();
      if (corpo.erro) mensagem = corpo.erro;
    } catch {
      // resposta sem JSON: fica a mensagem padrão
    }
    const erro = new Error(mensagem);
    erro.status = resposta.status;
    throw erro;
  }

  // O login guarda nome e nome de usuário no navegador (chave "usuario"): mantém em dia.
  try {
    const salvo = JSON.parse(localStorage.getItem("usuario"));
    if (salvo) {
      localStorage.setItem("usuario", JSON.stringify({ ...salvo, nome: nome.trim(), userName: userName.trim() }));
    }
  } catch {
    // dado salvo ilegível: não atrapalha a edição
  }
}

// ---- aviso entre telas ----
// Depois de salvar o perfil, a barra de navegação (que fica fora da página de Perfil)
// precisa trocar a foto. Para isso a página avisa pelo navegador e a barra escuta o aviso.
const NOME_DO_AVISO = "perfil-atualizado";

export function avisarPerfilAtualizado(foto) {
  window.dispatchEvent(new CustomEvent(NOME_DO_AVISO, { detail: { foto } }));
}

// Chama aoMudar(foto) a cada aviso. Devolve a função que para de escutar.
export function ouvirPerfilAtualizado(aoMudar) {
  const tratar = (evento) => aoMudar(evento.detail.foto);
  window.addEventListener(NOME_DO_AVISO, tratar);
  return () => window.removeEventListener(NOME_DO_AVISO, tratar);
}
