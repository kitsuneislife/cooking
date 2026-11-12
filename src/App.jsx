import { lazy, Suspense, useSyncExternalStore } from "react";
import { NavLink, Route, Routes, useMatch } from "react-router-dom";
import { SharedArtDefs } from "./components/Illustration";
import StatusMessage from "./components/StatusMessage";
import Chef from "./components/Chef";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import NotFound from "./pages/NotFound";

// a partida traz o three.js: só baixa quando alguém vai jogar
const Play = lazy(() => import("./pages/Play"));

// O jogo é só para computador: tela de toque ou janela pequena demais mostram um aviso.
const SMALL = matchMedia("(hover: none) and (pointer: coarse), (max-width: 899px), (max-height: 559px)");
const watchSmall = (f) => { SMALL.addEventListener("change", f); return () => SMALL.removeEventListener("change", f); };

export default function App() {
  // a partida ocupa a tela toda: sem cabeçalho nem rodapé do site
  const playing = useMatch("/jogar/:id");
  const small = useSyncExternalStore(watchSmall, () => SMALL.matches);
  if (small) {
    return (
      <main className="desktop-only">
        <Chef />
        <h1 className="logo-big">Cozinhe <span>Comigo</span></h1>
        <p>Este jogo é feito para computador. Abra num navegador de tela grande (ou aumente a janela) para cozinhar!</p>
      </main>
    );
  }
  return (
    <>
      <SharedArtDefs />
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      {!playing && (
        <header className="site-header">
          <NavLink to="/" className="logo">Cozinhe Comigo</NavLink>
          <nav aria-label="Principal">
            <NavLink to="/" end>Início</NavLink>
          </nav>
        </header>
      )}
      <main id="main" className={playing ? "main-game" : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/receitas/:id" element={<RecipeDetail />} />
          <Route path="/jogar/:id" element={
            <Suspense fallback={<div className="game game-waiting"><StatusMessage status="loading">Abrindo a cozinha…</StatusMessage></div>}>
              <Play />
            </Suspense>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!playing && (
        <footer className="site-footer">
          Receitas da <a href="https://dummyjson.com/docs/recipes">DummyJSON</a>. Seis pedidos para cozinhar.
        </footer>
      )}
    </>
  );
}
