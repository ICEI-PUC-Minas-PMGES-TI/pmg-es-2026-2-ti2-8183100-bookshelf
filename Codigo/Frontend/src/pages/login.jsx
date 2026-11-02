import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        console.log(email, senha);
    }

    return (
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
    );
}
