import { useState } from "react";
import "./popUpCadastro.css";

export default function CadastroModal({ aberto, fechar }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [usuario, setUsuario] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");

    if (!aberto) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const dadosUsuario = {
            nome,
            usuario,
            dataNascimento,
            email,
            senha
        };

        console.log(dadosUsuario);

        
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
                        value={usuario}
                        onChange={(event) => setUsuario(event.target.value)}
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