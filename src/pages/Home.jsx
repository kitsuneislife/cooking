import { useRecipe } from "../hooks/useRecipe";
import { games, MENU } from "../data/games";
import RecipeCard from "../components/RecipeCard";
import StatusMessage from "../components/StatusMessage";
import Chef from "../components/Chef";
import { useMusic } from "../hooks/useMusic";
import { MUSIC } from "../data/music";

// Um pedido do cardápio: cada card busca a própria receita na API.
function Order({ id }) {
  const { status, recipe, error, retry } = useRecipe(id);
  if (status === "loading") return <StatusMessage status="loading">Buscando {games[id].title}…</StatusMessage>;
  if (status === "error") return <StatusMessage status="error" onRetry={retry}>Não deu para carregar {games[id].title}. {error.message}</StatusMessage>;
  return <RecipeCard recipe={recipe} title={games[id].title} playable />;
}

export default function Home() {
  useMusic(MUSIC.title);
  return (
    <div className="title-screen">
      <section className="hero">
        <Chef mood="happy" />
        <h1 className="logo-big">Cozinhe <span>Comigo</span></h1>
        <p>Um jogo de cozinha com receitas de verdade.</p>
      </section>

      <section aria-labelledby="menu-title">
        <h2 id="menu-title" className="section-title">Pedidos do dia</h2>
        <ul className="menu">
          {MENU.map((id) => <li key={id}><Order id={id} /></li>)}
        </ul>
      </section>
    </div>
  );
}
