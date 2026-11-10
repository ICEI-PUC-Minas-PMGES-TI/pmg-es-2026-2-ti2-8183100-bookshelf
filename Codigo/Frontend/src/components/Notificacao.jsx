
import { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import "./Notificacao.css";

const icones = {
  sucesso: CheckCircle2,
  erro: AlertCircle,
  aviso: AlertTriangle,
  info: Info
};

function Notificacao({
  tipo = "info",
  titulo,
  mensagem,
  onClose
}) {
  const Icone = icones[tipo] || Info;

  useEffect(() => {
    const temporizador = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(temporizador);
  }, [onClose]);

  return (
    <div
      className={`notificacao notificacao-${tipo}`}
      role={tipo === "erro" ? "alert" : "status"}
      aria-live={tipo === "erro" ? "assertive" : "polite"}
    >
      <div className="notificacao-icone">
        <Icone size={22} />
      </div>

      <div className="notificacao-conteudo">
        <strong>{titulo}</strong>
        <p>{mensagem}</p>
      </div>

      <button
        type="button"
        className="notificacao-fechar"
        onClick={onClose}
        aria-label="Fechar notificação"
      >
        <X size={18} />
      </button>

      <span className="notificacao-progresso" />
    </div>
  );
}

export default Notificacao;
