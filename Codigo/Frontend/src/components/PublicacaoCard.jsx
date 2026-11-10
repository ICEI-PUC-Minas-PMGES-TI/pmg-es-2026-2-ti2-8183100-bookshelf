import CapaLivro from "./CapaLivro";

import "./PublicacaoCard.css";

function PublicacaoCard({ publicacao }) {
    const {
        usuario = "Usuário desconhecido",
        userName = "leitor",
        tituloLivro = "Livro sem título",
        dataPublicacao,
        resenha,
        avaliacao = 0,
        livro
    } = publicacao;

    const textoResenha =
        typeof resenha === "string"
            ? resenha
            : resenha?.conteudo || "";

    const titulo = livro?.titulo || tituloLivro;
    const capa = livro?.capa || livro?.thumbnail || null;
    const autores = Array.isArray(livro?.autores)
        ? livro.autores
        : Array.isArray(livro?.authors)
            ? livro.authors
            : [];

    const iniciais = usuario
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();

    return (
        <article className="publicacao-card">
            <header className="publicacao-header">
                <div className="publicacao-usuario">
                    <div className="publicacao-avatar" aria-hidden="true">
                        {iniciais}
                    </div>

                    <div className="publicacao-usuario-info">
                        <h3>{usuario}</h3>
                        <span>@{userName}</span>
                    </div>
                </div>

                <time className="publicacao-data">
                    {dataPublicacao}
                </time>
            </header>

            <div className="publicacao-livro">
                <div className="publicacao-capa publicacao-capa-real">
                    <CapaLivro livro={{ title: titulo, thumbnail: capa }} />
                </div>

                <div className="publicacao-livro-info">
                    <span className="publicacao-label">
                        Resenha
                    </span>

                    <h4>{titulo}</h4>

                    {autores.length > 0 && (
                        <span className="publicacao-livro-autores">
                            {autores.join(", ")}
                        </span>
                    )}

                    <div
                        className="publicacao-avaliacao"
                        aria-label={`Avaliação: ${avaliacao} de 5 estrelas`}
                    >
                        {Array.from({ length: 5 }, (_, index) => (
                            <span
                                key={index}
                                className={
                                    index < avaliacao
                                        ? "publicacao-estrela ativa"
                                        : "publicacao-estrela"
                                }
                                aria-hidden="true"
                            >
                                ★
                            </span>
                        ))}

                        <span className="publicacao-nota">
                            {avaliacao}/5
                        </span>
                    </div>
                </div>
            </div>

            <div className="publicacao-resenha">
                <p>{textoResenha}</p>
            </div>

            <footer className="publicacao-footer">
                <span className="publicacao-livro-indicador">
                    <span aria-hidden="true">▤</span>
                    Leitura compartilhada
                </span>
            </footer>
        </article>
    );
}

export default PublicacaoCard;
