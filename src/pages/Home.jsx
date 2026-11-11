import { useRecipe } from "../hooks/useRecipe";
import { games, DEMO_ID } from "../data/games";
import RecipeCard from "../components/RecipeCard";
import StatusMessage from "../components/StatusMessage";
import Illustration from "../components/Illustration";
import Chef from "../components/Chef";

const HOW = [
  { art: "basket", title: "Mercado", text: "Pegue só o que está na lista. Cuidado com os intrusos!" },
  { art: "board", title: "Preparo", text: "Escolha o corte que a receita pede e pique na tábua." },
  { art: "stove", title: "Fogão", text: "Leve tudo para a estação certa e tire do fogo no ponto." },
];

export default function Home() {
  const { status, recipe, error, retry } = useRecipe(DEMO_ID);
  return (
    <div className="title-screen">
      <section className="hero">
        <Chef mood="happy" />
        <h1 className="logo-big">Cozinhe <span>Comigo</span></h1>
        <p>Um jogo de cozinha com receitas de verdade.</p>
      </section>

      <section aria-labelledby="demo-title">
        <h2 id="demo-title" className="section-title">Pedido do dia</h2>
        {status === "loading" && <StatusMessage status="loading">Buscando a receita na API…</StatusMessage>}
        {status === "error" && <StatusMessage status="error" onRetry={retry}>Não deu para carregar a receita. {error.message}</StatusMessage>}
        {recipe && <RecipeCard recipe={recipe} title={games[DEMO_ID].title} playable />}
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title" className="section-title">Como se joga</h2>
        <ol className="how">
          {HOW.map((h, n) => (
            <li key={h.title}>
              <Illustration name={h.art} className="art" />
              <h3><span aria-hidden="true">{n + 1}.</span> {h.title}</h3>
              <p>{h.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
