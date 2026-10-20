import PulseHeart from "./PulseHeart";
import "./PublicacaoCard.css";

function PublicacaoCard({ publicacao, onCurtir }) {
    const {
        usuario,
        userName,
        tituloLivro,
        dataPublicacao,
        resenha,
        avaliacao,
    } = publicacao;

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
                <div className="publicacao-capa" aria-hidden="true">
                    <span className="publicacao-capa-detalhe">BOOKMARK</span>
                    <span className="publicacao-capa-titulo">
                        {tituloLivro}
                    </span>
                    <span className="publicacao-capa-linha" />
                </div>

                <div className="publicacao-livro-info">
                    <span className="publicacao-label">RESENHA DE LIVRO</span>
                    <h4>{tituloLivro}</h4>

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
                <p>{resenha}</p>
            </div>

            <footer className="publicacao-footer">
                <PulseHeart
                    liked={publicacao.curtiu}
                    count={publicacao.curtidas}
                    onChange={onCurtir}
                    showCount
                    icon="heart"
                    size={24}
                    corner={24}
                    likedColor="#C6815B"
                    idleColor="#B09262"
                    pillColor="#F1E3D0"
                    textColor="#1E1E1E"
                    label="Curtir resenha"
                />

                <span className="publicacao-livro-indicador">
                    <span aria-hidden="true">▤</span>
                    Leitura compartilhada
                </span>
            </footer>
        </article>
    );
}

export default PublicacaoCard;
