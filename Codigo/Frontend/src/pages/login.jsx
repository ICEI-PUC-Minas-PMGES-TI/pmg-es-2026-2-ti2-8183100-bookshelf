import { useState } from "react";
import API_URL from "../services/api";
import CadastroModal from "../components/popUpCadastro";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [cadastro, setCadastro] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        console.log(senha);

        try {
            const response = await fetch(
                `http://localhost:3001/api/auth/login`,
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

            console.log("Login realizado!", dados);
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <main>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    required
                />
                <button type="submit">Entrar</button>
            </form>
            <section>
                <p>
                    Não tem uma conta?{" "}
                    <button
                        type="button"
                        onClick={() => setCadastro(true)}
                    >
                        Cadastre-se
                    </button>
                </p>

                <CadastroModal
                    aberto={cadastro}
                    fechar={() => setCadastro(false)}
                />
            </section>
        </main>
    );
}
