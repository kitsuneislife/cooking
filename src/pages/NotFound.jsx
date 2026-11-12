import { Link } from "react-router-dom";
import Chef from "../components/Chef";

export default function NotFound() {
  return (
    <section className="panel not-found" aria-labelledby="nf-title">
      <h1 id="nf-title" className="panel-title">Página não encontrada</h1>
      <Chef mood="sad" />
      <p>Esse prato não está no cardápio.</p>
      <Link className="btn" to="/">Voltar ao início</Link>
    </section>
  );
}
