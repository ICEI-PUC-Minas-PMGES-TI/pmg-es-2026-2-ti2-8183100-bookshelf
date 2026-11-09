import { urlDoUsuario } from "./listasService";

export async function enviarConfiguracoes(dados, metodo = "PUT") {
  let resposta;
  try {
    const endereco = urlDoUsuario().replace("/api/usuarios/", "/api/configuracoes/");
    resposta = await fetch(endereco, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new Error("Não foi possível conectar. Verifique sua conexão e tente novamente.");
  }
  if (!resposta.ok) {
    if (resposta.status === 404) {
      throw new Error("As configurações ainda não estão disponíveis neste servidor. Verifique a atualização do backend.");
    }
    let corpo = {};
    try { corpo = await resposta.json(); } catch { /* Usa a mensagem padrão. */ }
    throw new Error(corpo.erro || "Não foi possível concluir. Tente novamente.");
  }
  if (metodo === "DELETE") return;
  let salvo = {};
  try { salvo = JSON.parse(localStorage.getItem("usuario") || "{}"); } catch { /* Recupera dados locais antigos. */ }
  const { nome, userName, email } = dados;
  localStorage.setItem("usuario", JSON.stringify({
    ...salvo,
    ...(nome !== undefined && { nome }),
    ...(userName !== undefined && { userName }),
    ...(email !== undefined && { email }),
  }));
}
