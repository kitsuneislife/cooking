import { lazy, Suspense, useSyncExternalStore } from "react";
import { Link, Route, Routes, useMatch } from "react-router-dom";
import StatusMessage from "./components/StatusMessage";
import Chef from "./components/Chef";
import Logo from "./components/Logo";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import NotFound from "./pages/NotFound";
import { LangSwitch, useLang } from "./i18n";

// a partida traz o three.js: só baixa quando alguém vai jogar
const Play = lazy(() => import("./pages/Play"));

// O jogo é só para computador: tela de toque ou janela pequena demais mostram um aviso.
const SMALL = matchMedia("(hover: none) and (pointer: coarse), (max-width: 899px), (max-height: 559px)");
const watchSmall = (f) => { SMALL.addEventListener("change", f); return () => SMALL.removeEventListener("change", f); };

export default function App() {
  // a partida ocupa a tela toda: sem cabeçalho nem rodapé do site
  const playing = useMatch("/jogar/:id");
  // na tela de título o logotipo grande já está no meio: o cabeçalho some
  const home = useMatch("/");
  const { t } = useLang();
  const small = useSyncExternalStore(watchSmall, () => SMALL.matches);
  if (small) {
    return (
      <main className="desktop-only">
        <Chef mood="love" />
        <Logo as="h1" className="logo-big" />
        <p>Este jogo é feito para computador. Abra num navegador de tela grande (ou aumente a janela) para cozinhar!</p>
      </main>
    );
  }
  return (
    <>
      <a className="skip-link" href="#main">{t.skip}</a>
      {!playing && <LangSwitch />}
      {!playing && !home && (
        <header className="site-header">
          <Link to="/" className="corner-btn" aria-label={t.home}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10 5 L4 11 L10 17 M4.5 11 H14 C18 11 20 13.5 20 17 V19" /></svg>
          </Link>
          <Link to="/" className="logo-link"><Logo /></Link>
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
          {t.footerFrom} <a href="https://dummyjson.com/docs/recipes">DummyJSON</a>. {t.footer}
        </footer>
      )}
    </>
  );
}
