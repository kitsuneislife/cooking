import { useSearchParams } from "react-router-dom";
import { useRecipe, useRecipes } from "../hooks/useRecipe";
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

// Catálogo: as outras receitas da API, que ainda não viraram pedido do jogo. Só dá para ler a receita.
function Catalog() {
  const { status, recipes, error, retry } = useRecipes();
  if (status === "loading") return <StatusMessage status="loading">Buscando o catálogo…</StatusMessage>;
  if (status === "error") return <StatusMessage status="error" onRetry={retry}>Não deu para carregar o catálogo. {error.message}</StatusMessage>;
  const rest = recipes.filter((r) => !MENU.includes(r.id));
  return (
    <ul className="menu catalog" aria-label={`${rest.length} receitas no catálogo`}>
      {rest.map((recipe, n) => <li key={recipe.id}><RecipeCard recipe={recipe} n={n} /></li>)}
    </ul>
  );
}

const TABS = [
  { id: "pedidos", label: "Pedidos do dia" },
  { id: "catalogo", label: "Catálogo" },
];

export default function Home() {
  // a aba fica na URL: voltar de uma receita do catálogo cai de novo no catálogo
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") === "catalogo" ? "catalogo" : "pedidos";
  const choose = (id) => setParams(id === "pedidos" ? {} : { aba: id }, { replace: true });
  // setas trocam de aba, como pede o padrão de abas da WAI-ARIA
  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = TABS[(TABS.findIndex((t) => t.id === tab) + 1) % TABS.length].id;
    choose(next);
    document.getElementById(`tab-${next}`)?.focus();
  };
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

      <section className="orders">
        <h2 className="visually-hidden">Receitas</h2>
        <div className="tabs" role="tablist" aria-label="Receitas" onKeyDown={onKeyDown}>
          {TABS.map((t) => (
            <button
              key={t.id} id={`tab-${t.id}`} type="button" role="tab" className="ribbon tab"
              aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
              onClick={() => choose(t.id)}
            >{t.label}</button>
          ))}
        </div>
        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="tab-panel">
          {tab === "pedidos" ? (
            <ul className="menu">
              {MENU.map((id, n) => <li key={id}><Order id={id} n={n} /></li>)}
            </ul>
          ) : <Catalog />}
        </div>
      </section>
    </div>
  );
}
