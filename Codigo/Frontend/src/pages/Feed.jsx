import { useState } from "react";
import "./Feed.css";
import PublicacaoCard from "../components/PublicacaoCard";


const publicacoesIniciais = [
    {
        id: 1,
        usuario: "Giovanni Arenare",
        userName: "GioAre",
        tituloLivro: "O Hobbit",
        dataPublicacao: "05/10/2026",
        resenha:
            "Gostei bastante do livro. A história é envolvente e os personagens são muito interessantes.",
        avaliacao: 5,
        curtidas: 12,
        curtiu: false,
    },
    {
        id: 2,
        usuario: "Igor Franças",
        userName: "IgFr",
        tituloLivro: "A Biblioteca da Meia-Noite",
        dataPublicacao: "06/10/2026",
        resenha:
            "Uma leitura que faz a gente refletir sobre as escolhas da vida e os caminhos que poderíamos ter seguido.",
        avaliacao: 4,
        curtidas: 8,
        curtiu: false,
    },
    {
        id: 3,
        usuario: "Luis Lgnoaco",
        userName: "LuLg",
        tituloLivro: "O Pequeno Príncipe",
        dataPublicacao: "07/10/2026",
        resenha:
            "Um livro simples na escrita, mas cheio de significados. Acho que cada leitura revela algo diferente.",
        avaliacao: 5,
        curtidas: 21,
        curtiu: true,
    },
];

function Feed() {

    const [publicacoes, setPublicacoes] = useState(publicacoesIniciais);
    const [formAberto, setFormAberto] = useState(false);
    const [tituloLivro, setTituloLivro] = useState("");
    const [resenha, setResenha] = useState("");
    const [avaliacao, setAvaliacao] = useState(5);

    function alternarCurtida(id) {
        setPublicacoes((atuais) =>
            atuais.map((publicacao) => {
                if (publicacao.id !== id) return publicacao;

                const curtiu = !publicacao.curtiu;

                return {
                    ...publicacao,
                    curtiu,
                    curtidas: publicacao.curtidas + (curtiu ? 1 : -1),
                };
            })
        );
    }

    function publicarResenha(event) {
        event.preventDefault();

        if (!tituloLivro.trim() || !resenha.trim()) return;

        const novaPublicacao = {
            id: Date.now(),
            usuario: "Giovanni Arenare",
            userName: "giovanni",
            tituloLivro: tituloLivro.trim(),
            dataPublicacao: new Date().toLocaleDateString("pt-BR"),
            resenha: resenha.trim(),
            avaliacao,
            curtidas: 0,
            curtiu: false,
        };

        setPublicacoes((atuais) => [novaPublicacao, ...atuais]);

        setTituloLivro("");
        setResenha("");
        setAvaliacao(5);
        setFormAberto(false);
    }

    return (
        <main className="feed-page">
            <div className="feed-book">
                <div className="feed-book-pages">
                    <header className="feed-header">
                        <div>
                            <span className="feed-eyebrow">
                                COMUNIDADE BOOKMARK
                            </span>

                            <h1>Feed</h1>

                            <p>
                                Descubra leituras, compartilhe opiniões e
                                acompanhe a jornada de outros leitores.
                            </p>
                        </div>

                        <div className="feed-header-actions">
                            <span className="feed-publication-count">
                                <strong>{publicacoes.length}</strong>
                                {publicacoes.length === 1 ? " publicação" : " publicações"}
                            </span>

                            <button
                                className="feed-create-button"
                                type="button"
                                onClick={() => setFormAberto((aberto) => !aberto)}
                            >
                                <span aria-hidden="true">+</span>
                                Escrever resenha
                            </button>
                        </div>
                    </header>

                    {formAberto && (
                        <form
                            className="feed-form"
                            onSubmit={publicarResenha}
                        >
                            <div className="feed-form-header">
                                <div>
                                    <span className="feed-eyebrow">
                                        SUA LEITURA
                                    </span>
                                    <h2>Compartilhe sua opinião</h2>
                                </div>

                                <button
                                    className="feed-close-button"
                                    type="button"
                                    onClick={() => setFormAberto(false)}
                                    aria-label="Fechar formulário"
                                >
                                    ×
                                </button>
                            </div>

                            <label htmlFor="tituloLivro">
                                Nome do livro
                            </label>

                            <input
                                id="tituloLivro"
                                type="text"
                                placeholder="Qual livro você leu?"
                                value={tituloLivro}
                                onChange={(event) =>
                                    setTituloLivro(event.target.value)
                                }
                                required
                            />

                            <label>Sua avaliação</label>

                            <div
                                className="feed-rating"
                                aria-label={`Avaliação: ${avaliacao} de 5`}
                            >
                                {[1, 2, 3, 4, 5].map((estrela) => (
                                    <button
                                        key={estrela}
                                        type="button"
                                        className={
                                            estrela <= avaliacao ? "selected" : ""
                                        }
                                        onClick={() => setAvaliacao(estrela)}
                                        aria-label={`${estrela} ${estrela === 1 ? "estrela" : "estrelas"
                                            }`}
                                        aria-pressed={avaliacao === estrela}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            <label htmlFor="resenha">Sua resenha</label>

                            <textarea
                                id="resenha"
                                placeholder="O que você achou dessa leitura?"
                                value={resenha}
                                onChange={(event) =>
                                    setResenha(event.target.value)
                                }
                                rows={4}
                                required
                            />

                            <div className="feed-form-actions">
                                <button
                                    className="feed-cancel-button"
                                    type="button"
                                    onClick={() => setFormAberto(false)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="feed-submit-button"
                                    type="submit"
                                >
                                    Publicar resenha
                                </button>
                            </div>
                        </form>
                    )}

                    <section
                        className="feed-publications"
                        aria-label="Publicações da comunidade"
                    >

                        {publicacoes.length > 0 ? (
                            <div className="feed-publications-list">
                                {publicacoes.map((publicacao) => (
                                    <PublicacaoCard
                                        key={publicacao.id}
                                        publicacao={publicacao}
                                        onCurtir={() =>
                                            alternarCurtida(publicacao.id)
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="feed-empty">
                                <span aria-hidden="true">📚</span>
                                <h3>O Feed está esperando por você</h3>
                                <p>
                                    Compartilhe sua primeira resenha com
                                    a comunidade.
                                </p>
                            </div>
                        )}
                    </section>

                    <footer className="feed-book-footer">
                        <span>BOOKMARK</span>
                        <span>Compartilhando histórias</span>
                    </footer>
                </div>
            </div>
        </main>
    );
}

export default Feed;