import { useState } from "react";
import "./metricasModal.css";
import API_URL from "../services/api";

export default function MetricasModal({ aberto, fechar, lendo, favoritos, lerDepois, usuarioId, carregarUsuario }) {
    const [livroId, setLivroId] = useState("");
    const [pagInicial, setPagInicial] = useState("");
    const [pagFinal, setPagFinal] = useState("");
    const [horas, setHoras] = useState(0);
    const [minutos, setMinutos] = useState(0);
    const [avaliacao, setAvaliacao] = useState(5);

    const livrosDisponiveis = [
        ...lendo,
        ...favoritos,
        ...lerDepois
    ].filter((livro, index, self) =>
        index === self.findIndex(l => l.id === livro.id)
    );

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

                    <label>Livro</label>
                    <select
                        value={livroId}
                        onChange={(event) => setLivroId(event.target.value)}
                        required
                    >
                        <option value="">Selecione um livro</option>
                        {livrosDisponiveis.map((livro) => (
                            <option key={livro.id} value={livro.id}>
                                {livro.title}
                            </option>
                        ))}
                    </select>
                    <label>Página inicial</label>
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