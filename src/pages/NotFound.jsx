import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page">
      <h1>Página não encontrada</h1>
      <p>Esse prato não está no cardápio.</p>
      <Link className="btn" to="/">Voltar ao início</Link>
    </section>
  );
}
