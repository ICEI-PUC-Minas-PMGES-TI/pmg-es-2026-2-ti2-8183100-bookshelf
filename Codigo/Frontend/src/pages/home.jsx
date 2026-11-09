import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-kicker">SEU CANTO DE LEITURA</span>
          <h1>Histórias para guardar, conversar e revisitar.</h1>
          <p>
            Organize suas leituras, descubra novos livros e compartilhe as
            páginas que fizeram parte da sua jornada.
          </p>
          <div className="home-actions">
            <Link to="/catalogo" className="home-action home-action--primary">Explorar catálogo</Link>
            <Link to="/feed" className="home-action home-action--secondary">Ver o feed</Link>
          </div>
        </div>

        <div className="home-hero__art" aria-hidden="true">
          <div className="home-cup">
            <span className="home-cup__steam home-cup__steam--one" />
            <span className="home-cup__steam home-cup__steam--two" />
            <span className="home-cup__rim" />
            <span className="home-cup__body" />
            <span className="home-cup__handle" />
          </div>
          <span className="home-note home-note--top">uma página por vez</span>
          <span className="home-note home-note--bottom">BookMark</span>
        </div>
      </section>

      <section className="home-highlights" aria-label="Recursos do BookMark">
        <article>
          <span className="home-highlight__number">01</span>
          <h2>Descubra</h2>
          <p>Encontre livros por título, autor, idioma e categoria.</p>
        </article>
        <article>
          <span className="home-highlight__number">02</span>
          <h2>Organize</h2>
          <p>Monte listas pessoais para acompanhar cada fase da leitura.</p>
        </article>
        <article>
          <span className="home-highlight__number">03</span>
          <h2>Compartilhe</h2>
          <p>Registre resenhas e acompanhe as leituras da comunidade.</p>
        </article>
      </section>
    </main>
  );
}
