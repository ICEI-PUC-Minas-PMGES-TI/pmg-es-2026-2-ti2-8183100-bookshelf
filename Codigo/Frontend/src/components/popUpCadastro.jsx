import { useState } from "react";
import "./popUpCadastro.css";
import API_URL from "../services/api";

export default function CadastroModal({ aberto, fechar }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [userName, setUserName] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");

    if (!aberto) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const dadosUsuario = {
            nome,
            userName,
            email,
            senha,
            dataNascimento
        };

        try {
            const response = await fetch(
                `http://localhost:3001/api/usuarios`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        dadosUsuario
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

                <h2>Criar conta</h2>
                <p>Preencha os dados para se cadastrar.</p>

                <form onSubmit={handleSubmit}>
                    <label>Nome completo</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        required
                    />

                    <label>Nome de usuário</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(event) => setUserName(event.target.value)}
                        required
                    />

                    <label>Data de nascimento</label>
                    <input
                        type="date"
                        value={dataNascimento}
                        onChange={(event) => setDataNascimento(event.target.value)}
                        required
                    />

                    <label>E-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label>Senha</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(event) =>
                            setSenha(event.target.value)
                        }
                        required
                    />

                    <button type="submit">
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}