import { useRecipe } from "../hooks/useRecipe";
import { games, MENU } from "../data/games";
import RecipeCard from "../components/RecipeCard";
import StatusMessage from "../components/StatusMessage";
import Chef from "../components/Chef";
import Logo from "../components/Logo";
import { useMusic } from "../hooks/useMusic";
import { MUSIC } from "../data/music";

// Um pedido do cardápio: cada card busca a própria receita na API.
function Order({ id, n }) {
  const { status, recipe, error, retry } = useRecipe(id);
  if (status === "loading") return <StatusMessage status="loading">Buscando {games[id].title}…</StatusMessage>;
  if (status === "error") return <StatusMessage status="error" onRetry={retry}>Não deu para carregar {games[id].title}. {error.message}</StatusMessage>;
  return <RecipeCard recipe={recipe} game={games[id]} n={n} />;
}

export default function Home() {
  useMusic(MUSIC.title);
  return (
    <div className="title-screen">
      <section className="hero">
        <Logo as="h1" className="logo-big" />
        <div className="hero-chef">
          <Chef />
          <p className="hero-bubble">Escolha um pedido e vamos cozinhar juntos!</p>
        </div>
        <p className="hero-tagline">Um jogo de cozinha com receitas de verdade.</p>
      </section>

      <section className="orders" aria-labelledby="menu-title">
        <h2 id="menu-title" className="ribbon">Pedidos do dia</h2>
        <ul className="menu">
          {MENU.map((id, n) => <li key={id}><Order id={id} n={n} /></li>)}
        </ul>
      </section>
    </div>
  );
}
