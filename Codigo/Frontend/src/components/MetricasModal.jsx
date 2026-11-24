import { useState, useEffect } from "react";
import "./metricasModal.css";
import API_URL from "../services/api";
import { buscarLivros } from "../services/booksService";


export default function MetricasModal({ aberto, fechar, lendo, favoritos, lerDepois, usuarioId, carregarUsuario }) {
    function selecionarLivro(livro) {
        setLivroId(livro.id);
        setLivroSelecionado(livro);
        setDropdownAberto(false);
        setBuscaLivro("");
        setLivrosEncontrados([]);
    }
    const [livroId, setLivroId] = useState("");
    const [pagInicial, setPagInicial] = useState("");
    const [pagFinal, setPagFinal] = useState("");
    const [horas, setHoras] = useState(0);
    const [minutos, setMinutos] = useState(0);
    const [avaliacao, setAvaliacao] = useState(5);
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const [buscaLivro, setBuscaLivro] = useState("");
    const [livroSelecionado, setLivroSelecionado] = useState(null);
    const [livrosEncontrados, setLivrosEncontrados] = useState([]);
    const [buscandoLivros, setBuscandoLivros] = useState(false);

    const livrosDisponiveis = [
        ...lendo,
        ...favoritos,
        ...lerDepois
    ].filter((livro, index, self) =>
        index === self.findIndex(l => l.id === livro.id)
    );

    useEffect(() => {
        if (!dropdownAberto || buscaLivro.trim().length < 2) {
            setLivrosEncontrados([]);
            setBuscandoLivros(false);
            return;
        }

        let cancelado = false;

        const temporizador = setTimeout(async () => {
            try {
                setBuscandoLivros(true);

                const resultados = await buscarLivros(buscaLivro.trim());

                if (!cancelado) {
                    setLivrosEncontrados(resultados);
                }
            } catch (error) {
                console.error("Erro ao pesquisar livros:", error);

                if (!cancelado) {
                    setLivrosEncontrados([]);
                }
            } finally {
                if (!cancelado) {
                    setBuscandoLivros(false);
                }
            }
        }, 400);

        return () => {
            cancelado = true;
            clearTimeout(temporizador);
        };
    }, [buscaLivro, dropdownAberto]);

    const token = localStorage.getItem("token");

    if (!aberto) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const tempoLeituraMinutos = Number(horas) * 60 + Number(minutos);
        const paginasLidas = Number(pagFinal) - Number(pagInicial);
        const hoje = new Date();
        const dataLeitura =
            `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

        const dadosmetrica = {
            usuarioId,
            livroId,
            pagInicial,
            pagFinal,
            paginasLidas,
            tempoLeituraMinutos,
            avaliacao,
            dataLeitura
        };

        try {
            const response = await fetch(
                `${API_URL}/api/metricas`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        dadosmetrica
                    )
                }
            );
            const dados = await response.json();

            if (response.status === 409) {
                alert(dados.erro);
                return;
            }

            if (!response.ok) {
                throw new Error(dados.erro || "Erro ao cadastrar usuário.");
            }

            alert("Cadastro realizado com sucesso!");
            carregarUsuario();
            fechar();

        } catch (error) {
            console.error(error.message);
        }


    }

    return (

        <div className="modal-overlay" onClick={fechar}>
            <div
                className="modal-container"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    className="modal-fechar"
                    onClick={fechar}
                    type="button"
                >
                    &times;
                </button>
                <h2>Adicionar Leitura</h2>
                <form onSubmit={handleSubmit}>

                    <div className="metricas-livro-dropdown">

                        <label>Livro</label>

                        <button
                            type="button"
                            className="metricas-livro-trigger"
                            onClick={() => setDropdownAberto(!dropdownAberto)}
                        >
                            {livroSelecionado ? (
                                <>
                                    <img
                                        src={livroSelecionado.thumbnail}
                                        alt=""
                                    />
                                    <span>
                                        <strong>{livroSelecionado.title}</strong>
                                        <small>
                                            {livroSelecionado.authors?.join(", ") ||
                                                "Autor desconhecido"}
                                        </small>
                                    </span>
                                </>
                            ) : (
                                <span>Selecione um livro</span>
                            )}

                            <span>⌄</span>
                        </button>

                        {dropdownAberto && (
                            <div className="metricas-livro-options">

                                <input
                                    type="search"
                                    placeholder="Pesquisar outros livros..."
                                    value={buscaLivro}
                                    onChange={(event) => setBuscaLivro(event.target.value)}
                                />

                                {buscandoLivros && (
                                    <p>Pesquisando livros...</p>
                                )}

                                {/* Livros da biblioteca */}
                                {buscaLivro.trim().length < 2 && (
                                    <>
                                        <small className="metricas-livro-section">
                                            Minha biblioteca
                                        </small>

                                        {livrosDisponiveis.map((livro) => (
                                            <button
                                                key={livro.id}
                                                type="button"
                                                className="metricas-livro-option"
                                                onClick={() => selecionarLivro(livro)}
                                            >
                                                {livro.thumbnail ? (
                                                    <img src={livro.thumbnail} alt="" />
                                                ) : (
                                                    <span>📖</span>
                                                )}

                                                <span>
                                                    <strong>{livro.title}</strong>
                                                    <small>
                                                        {livro.authors?.join(", ") ||
                                                            "Autor desconhecido"}
                                                    </small>
                                                </span>
                                            </button>
                                        ))}
                                    </>
                                )}

                                {/* Resultados da Google Books */}
                                {buscaLivro.trim().length >= 2 && (
                                    <>
                                        <small className="metricas-livro-section">
                                            Resultados da pesquisa
                                        </small>

                                        {livrosEncontrados.map((livro) => (
                                            <button
                                                key={livro.id}
                                                type="button"
                                                className="metricas-livro-option"
                                                onClick={() => selecionarLivro(livro)}
                                            >
                                                {livro.thumbnail ? (
                                                    <img src={livro.thumbnail} alt="" />
                                                ) : (
                                                    <span>📖</span>
                                                )}

                                                <span>
                                                    <strong>{livro.title}</strong>
                                                    <small>
                                                        {livro.authors?.join(", ") ||
                                                            "Autor desconhecido"}
                                                    </small>
                                                </span>
                                            </button>
                                        ))}

                                        {!buscandoLivros &&
                                            livrosEncontrados.length === 0 && (
                                                <p>Nenhum livro encontrado.</p>
                                            )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <label>Página começada a leitura</label>
                    <input
                        type="number"
                        min="1"
                        value={pagInicial}
                        onChange={(event) => setPagInicial(event.target.value)}
                        required
                    />
                    <label>Última página lida</label>
                    <input
                        type="number"
                        min={pagInicial || 1}
                        value={pagFinal}
                        onChange={(event) => setPagFinal(event.target.value)}
                        required
                    />
                    <label>Tempo de leitura</label>
                    <div className="tempo-inputs">
                        <div>
                            <input
                                type="number"
                                min="0"
                                value={horas}
                                onChange={(event) => setHoras(event.target.value)}
                                placeholder="0"
                            />
                            <span>Horas</span>
                        </div>
                        <div>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={minutos}
                                onChange={(event) => setMinutos(event.target.value)}
                                placeholder="0"
                            />
                            <span>Minutos</span>
                        </div>
                    </div>
                    <label>Avaliação da leitura</label>
                    <div className="avaliacao-estrelas">
                        {[1, 2, 3, 4, 5].map((estrela) => (
                            <button
                                key={estrela}
                                type="button"
                                onClick={() => setAvaliacao(estrela)}
                                className={estrela <= avaliacao ? "estrela selecionada" : "estrela"}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <button type="submit">
                        Salvar
                    </button>
                </form>
            </div>
        </div>

    );
}