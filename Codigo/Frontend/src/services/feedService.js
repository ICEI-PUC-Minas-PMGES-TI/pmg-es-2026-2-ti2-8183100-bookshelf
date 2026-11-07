import API_URL from "./api";

// Busca as publicações cadastradas no MongoDB.
export async function obterPublicacoes() {
    const token = localStorage.getItem("token");

    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/publicacao`, {
        method: "GET",
        headers
    });

    const dados = await response.json();

    if (!response.ok) {
        throw new Error(
            dados.erro || `Erro HTTP ${response.status}`
        );
    }

    if (!Array.isArray(dados)) {
        throw new Error(
            "A API não retornou uma lista de publicações."
        );
    }

    return dados.map((publicacao) => {
        // Trata resenhas que chegam como objeto ou texto.
        const textoResenha =
            typeof publicacao.resenha === "string"
                ? publicacao.resenha
                : publicacao.resenha?.conteudo || "";

        const nota =
            publicacao.avaliacao ??
            publicacao.resenha?.avaliacao ??
            0;

        return {
            ...publicacao,
            id: publicacao._id,
            usuario: publicacao.usuario || "Usuário desconhecido",
            userName: publicacao.userName || "leitor",
            resenha: textoResenha,
            avaliacao: Number(nota),
            dataOrdenacao: publicacao.dataPublicacao,
            dataPublicacao: publicacao.dataPublicacao
                ? new Date(
                    publicacao.dataPublicacao
                ).toLocaleDateString("pt-BR")
                : "",
            curtidas: Number(publicacao.curtidas || 0),
            curtiu: Boolean(publicacao.curtiu)
        };
    });
}

// Cadastra uma nova publicação no MongoDB.
export async function criarPublicacao(publicacao) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/publicacao`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(publicacao)
    });

    const dados = await response.json();

    if (!response.ok) {
        throw new Error(
            dados.erro || "Erro ao cadastrar publicação."
        );
    }

    return dados;
}

// Alterna a curtida de uma publicação no MongoDB.
export async function alternarCurtidaAPI(id) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error(
            "Você precisa fazer login para curtir uma publicação."
        );
    }

    const response = await fetch(
        `${API_URL}/api/publicacao/${id}/curtir`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const dados = await response.json();

    if (!response.ok) {
        throw new Error(
            dados.erro || "Erro ao atualizar curtida."
        );
    }

    return dados;
}