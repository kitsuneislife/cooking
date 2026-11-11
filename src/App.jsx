import { lazy, Suspense } from "react";
import { NavLink, Route, Routes, useMatch } from "react-router-dom";
import { SharedArtDefs } from "./components/Illustration";
import StatusMessage from "./components/StatusMessage";
import { DEMO_ID } from "./data/games";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import NotFound from "./pages/NotFound";

// a partida traz o three.js: só baixa quando alguém vai jogar
const Play = lazy(() => import("./pages/Play"));

export default function App() {
  // a partida ocupa a tela toda: sem cabeçalho nem rodapé do site
  const playing = useMatch("/jogar/:id");
  return (
    <>
      <SharedArtDefs />
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      {!playing && (
        <header className="site-header">
          <NavLink to="/" className="logo">Cozinhe Comigo</NavLink>
          <nav aria-label="Principal">
            <NavLink to="/" end>Início</NavLink>
            <NavLink to={`/receitas/${DEMO_ID}`}>Receita da demo</NavLink>
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
          Receitas da <a href="https://dummyjson.com/docs/recipes">DummyJSON</a>. Demo com uma receita.
        </footer>
      )}
    </>
  );
}
