// Regras de validação da edição de perfil (usadas pelo servidor).
// Cada função devolve uma mensagem de erro, ou null quando está tudo certo.

export const LIMITE_NOME = 60;
export const LIMITE_USUARIO = 20;
export const LIMITE_BIO = 200;

// Formatos de imagem aceitos quando a foto é enviada como arquivo (data URL).
const FORMATO_IMAGEM = /^data:image\/(jpeg|png|webp);base64,/;
// Tamanho máximo da foto em texto (~300 KB de imagem).
const LIMITE_FOTO = 400000;

export function validarEdicaoPerfil(dados) {
  if (dados.nome !== undefined) {
    const nome = String(dados.nome).trim();
    if (!nome) return "O nome é obrigatório.";
    if (nome.length > LIMITE_NOME) return `O nome pode ter no máximo ${LIMITE_NOME} caracteres.`;
  }

  if (dados.userName !== undefined) {
    const usuario = String(dados.userName).trim();
    if (usuario.length < 3) return "O nome de usuário precisa ter pelo menos 3 caracteres.";
    if (usuario.length > LIMITE_USUARIO) return `O nome de usuário pode ter no máximo ${LIMITE_USUARIO} caracteres.`;
    if (!/^[A-Za-z0-9_.]+$/.test(usuario)) return "O nome de usuário só pode ter letras, números, ponto e _.";
  }

  if (dados.perfil !== undefined) {
    const { bio, foto } = dados.perfil ?? {};

    if (bio !== undefined && String(bio).length > LIMITE_BIO) {
      return `A descrição pode ter no máximo ${LIMITE_BIO} caracteres.`;
    }

    if (foto) {
      if (typeof foto !== "string") return "Foto inválida.";
      if (foto.startsWith("data:")) {
        if (!FORMATO_IMAGEM.test(foto)) return "A foto deve ser JPG, PNG ou WebP.";
        if (foto.length > LIMITE_FOTO) return "A foto é muito grande.";
      } else if (!/^https?:\/\//.test(foto)) {
        return "Foto inválida.";
      }
    }
  }

  return null;
}
