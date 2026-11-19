import { useSearchParams } from "react-router-dom";
import { useRecipe, useRecipes } from "../hooks/useRecipe";
import { games, MENU } from "../data/games";
import RecipeCard from "../components/RecipeCard";
import StatusMessage from "../components/StatusMessage";
import Chef from "../components/Chef";
import Logo from "../components/Logo";
import { useMusic } from "../hooks/useMusic";
import { MUSIC } from "../data/music";
import { useLang } from "../i18n";

// Um pedido do cardápio: cada card busca a própria receita na API.
function Order({ id, n }) {
  const { status, recipe, error, retry } = useRecipe(id);
  const { t } = useLang();
  const name = games[id].title;
  if (status === "loading") return <StatusMessage status="loading">{t.loadingOrder(name)}</StatusMessage>;
  if (status === "error") return <StatusMessage status="error" onRetry={retry}>{t.errorOrder(name)} {error.message}</StatusMessage>;
  return <RecipeCard recipe={recipe} game={games[id]} n={n} />;
}

// Catálogo: as outras receitas da API, que ainda não viraram pedido do jogo. Só dá para ler a receita.
function Catalog() {
  const { status, recipes, error, retry } = useRecipes();
  const { t } = useLang();
  if (status === "loading") return <StatusMessage status="loading">{t.loadingCatalog}</StatusMessage>;
  if (status === "error") return <StatusMessage status="error" onRetry={retry}>{t.errorCatalog} {error.message}</StatusMessage>;
  const rest = recipes.filter((r) => !MENU.includes(r.id));
  return (
    <ul className="menu catalog" aria-label={t.catalogCount(rest.length)}>
      {rest.map((recipe, n) => <li key={recipe.id}><RecipeCard recipe={recipe} n={n} /></li>)}
    </ul>
  );
}

const TABS = [
  { id: "pedidos", label: "today" },
  { id: "catalogo", label: "catalog" },
];

export default function Home() {
  // a aba fica na URL: voltar de uma receita do catálogo cai de novo no catálogo
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") === "catalogo" ? "catalogo" : "pedidos";
  const choose = (id) => setParams(id === "pedidos" ? {} : { aba: id }, { replace: true });
  // setas trocam de aba, como pede o padrão de abas da WAI-ARIA
  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = TABS[(TABS.findIndex((x) => x.id === tab) + 1) % TABS.length].id;
    choose(next);
    document.getElementById(`tab-${next}`)?.focus();
  };
  useMusic(MUSIC.title);
  const { t } = useLang();
  return (
    <div className="title-screen">
      <section className="hero">
        <Logo as="h1" className="logo-big" />
        <div className="hero-chef">
          <Chef />
          <p className="hero-bubble">{t.bubble}</p>
        </div>
        <p className="hero-tagline">{t.tagline}</p>
      </section>

      <section className="orders">
        <h2 className="visually-hidden">{t.recipes}</h2>
        <div className="tabs" role="tablist" aria-label={t.recipes} onKeyDown={onKeyDown}>
          {TABS.map((tb) => (
            <button
              key={tb.id} id={`tab-${tb.id}`} type="button" role="tab" className="ribbon tab"
              aria-selected={tab === tb.id} aria-controls={`panel-${tb.id}`} tabIndex={tab === tb.id ? 0 : -1}
              onClick={() => choose(tb.id)}
            >{t[tb.label]}</button>
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
