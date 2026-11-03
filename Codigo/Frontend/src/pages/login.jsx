import { useState } from "react";
import API_URL from "../services/api";
import CadastroModal from "../components/popUpCadastro";
import "./login.css"
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [cadastro, setCadastro] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        senha
                    })
                }
            );
            const dados = await response.json();
            if (!response.ok) {
                throw new Error(dados.erro || "Falha no login");
            }
            localStorage.setItem("token", dados.token);
            localStorage.setItem(
                "usuario",
                JSON.stringify(dados.usuario)
            );
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <main className="login-container">

            <section className="login-ilustracao">
                <p>
                    “Mesmo não sabendo que era amor,
                    sentiam que era bom.”
                </p>
                <span>Capitães de areia, Jorge Amado</span>
            </section>

            <section className="login-conteudo">

                <h1>
                    ‘Faça o login para continuar
                    sua jornada de leitura’
                </h1>

                <div className="login-card">
                    <form id="login-form" onSubmit={handleSubmit}>

                        <label>Digite seu Email:</label>
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                        <label>Digite sua senha:</label>
                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            required
                        />

                        <p>
                            Não tem login?{" "}
                            <button
                                type="button"
                                onClick={() => setCadastro(true)}
                            >
                                Cadastrar
                            </button>
                        </p>

                    </form>
                </div>

                <div className="login-botoes">
                    <button type="button" className="btn-cancelar">
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        form="login-form"
                        className="btn-entrar"
                    >
                        Entrar
                    </button>
                </div>

                <CadastroModal
                    aberto={cadastro}
                    fechar={() => setCadastro(false)}
                />

            </section>
        </main>
    );
}
