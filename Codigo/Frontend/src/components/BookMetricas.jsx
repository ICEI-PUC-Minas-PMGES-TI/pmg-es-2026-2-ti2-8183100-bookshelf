import "./BookMetricas.css"

function BookMetricas({ titulo, imagem }) {
    return (
        <div className="card-livro">
            <img src={imagem} alt={titulo} />
            <h3>{titulo}</h3>
        </div>
    );
}

export default BookMetricas;