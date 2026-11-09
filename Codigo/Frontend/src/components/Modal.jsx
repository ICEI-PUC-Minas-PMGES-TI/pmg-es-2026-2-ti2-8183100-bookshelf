import { useEffect, useId, useRef } from "react";
import "./Modal.css";

// Popup (janela sobre a página) usando o <dialog> do próprio navegador.
// Ele já cuida de prender o foco dentro da janela, fechar com Esc e escurecer o fundo.
//
// Como usar:
//   <Modal aberto={aberto} aoFechar={() => setAberto(false)} titulo="Meu título">
//     ...conteúdo...
//   </Modal>
export default function Modal({ aberto, aoFechar, titulo, children, classe = "" }) {
  const dialogo = useRef(null);
  const tituloId = useId();

  // Abre ou fecha o <dialog> sempre que a prop "aberto" mudar.
  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;

    if (aberto && !elemento.open) elemento.showModal();
    if (!aberto && elemento.open) elemento.close();
  }, [aberto]);

  // Clicar no fundo escuro (fora da janela) fecha o popup.
  function aoClicar(evento) {
    if (evento.target === dialogo.current) aoFechar();
  }

  // Esc: o navegador fecharia sozinho, mas queremos que o estado do React mande.
  function aoApertarEsc(evento) {
    evento.preventDefault();
    aoFechar();
  }

  return (
    <dialog
      ref={dialogo}
      className={`modal ${classe}`}
      aria-labelledby={tituloId}
      onClick={aoClicar}
      onCancel={aoApertarEsc}
    >
      <div className="modal__janela">
        <header className="modal__topo">
          <h2 id={tituloId} className="modal__titulo">{titulo}</h2>
          <button type="button" className="modal__fechar" onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo">{children}</div>
      </div>
    </dialog>
  );
}
