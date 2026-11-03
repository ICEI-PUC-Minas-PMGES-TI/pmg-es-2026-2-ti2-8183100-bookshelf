
import { useEffect, useState } from "react";
import PulseHeart from "./PulseHeart";
import CapaLivro from "./CapaLivro";
import { buscarLivros } from "../services/booksService";
import "./PublicacaoCard.css";

// Evita pesquisar novamente títulos que já foram consultados.
const cacheCapas = new Map();

async function buscarCapaLivro(titulo) {
    const chave = titulo.trim().toLowerCase();

    if (cacheCapas.has(chave)) {
        return cacheCapas.get(chave);
    }

    const busca = buscarLivros(titulo)
        .then((livros) => {
            if (!livros.length) return null;

            const normalizar = (texto) =>
                texto.normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .trim();

            return (
                livros.find(
                    (livro) => normalizar(livro.title) === normalizar(titulo)
                ) || livros[0]
            );
        })
        .catch((erro) => {
            console.error("Erro ao buscar capa do livro:", erro);
            return null;
        });

    cacheCapas.set(chave, busca);
    return busca;
}

function PublicacaoCard({ publicacao, onCurtir }) {
    const {
        usuario,
        userName,
        tituloLivro,
        dataPublicacao,
        resenha,
        avaliacao,
    } = publicacao;

    const [livroEncontrado, setLivroEncontrado] = useState(null);

    useEffect(() => {
        let ativo = true;

        setLivroEncontrado(null);

        buscarCapaLivro(tituloLivro).then((livro) => {
            if (ativo) {
                setLivroEncontrado(livro);
            }
        });

        return () => {
            ativo = false;
        };
    }, [tituloLivro]);

    const iniciais = (usuario || "Usuário")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();

    const livroParaExibir = livroEncontrado || {
        title: tituloLivro,
        thumbnail: null,
    };

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
                <div className="publicacao-capa">
                    <CapaLivro livro={livroParaExibir} />
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
                    <span aria-hidden="true">♤</span>
                    Leitura compartilhada
                </span>
            </footer>
        </article>
    );
}

export default PublicacaoCard;
