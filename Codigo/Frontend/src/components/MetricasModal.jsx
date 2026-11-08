import { useState } from "react";
import "./popUpCadastro.css";
import API_URL from "../services/api";

export default function MetricasModal({ aberto, fechar }) {
    const [nome, setNome] = useState("");
    const [pagInicial, setPagInicial] = useState("");
    const [pagFinal, setPagFinal] = useState("");
    const token = localStorage.getItem("token");

    if (!aberto) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const dadosmetrica = {
            nome,
            pagInicial,
            pagFinal
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

                <h2>Adicinar Leitura</h2>

                <form onSubmit={handleSubmit}>
                    <label>Livro</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        required
                    />

                    <label>Pagina inicial</label>
                    <input
                        type="text"
                        value={pagInicial}
                        onChange={(event) => setPagInicial(event.target.value)}
                        required
                    />

                    <label>Ultima pagina lida</label>
                    <input
                        type="text"
                        value={pagFinal}
                        onChange={(event) => setPagFinal(event.target.value)}
                        required
                    />

                    <button type="submit">
                        Salvar
                    </button>
                </form>
            </div>
        </div>
    );
}