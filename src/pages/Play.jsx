import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../hooks/useRecipe";
import { games, DEMO_ID, DIFFICULTY } from "../data/games";
import { missingIngredients, brokenSteps, comboMultiplier, timeLimit } from "../game/rules";
import { sfx, isMuted, toggleMute } from "../game/sound";
import { pop, shake } from "../game/fx";
import StatusMessage from "../components/StatusMessage";
import Illustration from "../components/Illustration";
import Icon from "../components/Icon";
import Chef from "../components/Chef";
import MarketPhase from "../components/MarketPhase";
import PrepPhase from "../components/PrepPhase";
import CookPhase from "../components/CookPhase";
import ResultPhase from "../components/ResultPhase";

const PHASES = [
  { key: "market", name: "Mercado", art: "basket", Phase: MarketPhase, hint: "Toque só no que está na lista de compras. Tem intruso na banca!" },
  { key: "prep", name: "Preparo", art: "board", Phase: PrepPhase, hint: "Leve cada ingrediente para a tábua e escolha o corte que a receita pede." },
  { key: "cook", name: "Fogão", art: "stove", Phase: CookPhase, hint: "Leia o passo e leve cada ingrediente para a estação certa." },
];

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function useCountdown(total, running) {
  const [left, setLeft] = useState(total);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return left;
}

export default function Play() {
  const { id } = useParams();
  const game = games[id];
  const { status, recipe, error, retry } = useRecipe(id);
  const [round, setRound] = useState(0);

  let problem = null;
  if (!game) {
    problem = <StatusMessage status="error">Por enquanto só a receita {DEMO_ID} tem fases prontas.</StatusMessage>;
  } else if (status === "loading") {
    problem = <StatusMessage status="loading">Buscando a receita na API…</StatusMessage>;
  } else if (status === "error") {
    problem = <StatusMessage status="error" onRetry={retry}>Não deu para carregar a receita. {error.message}</StatusMessage>;
  } else {
    const broken = [...missingIngredients(recipe, game), ...brokenSteps(game)];
    if (broken.length) problem = <StatusMessage status="error">Os dados do jogo não batem com a API: {broken.join(", ")}.</StatusMessage>;
  }
  if (problem) {
    return (
      <div className="game game-waiting">
        {problem}
        <Link className="btn btn-ghost" to="/">Voltar ao início</Link>
      </div>
    );
  }
  return <Match key={round} recipe={recipe} game={game} onReplay={() => setRound((r) => r + 1)} />;
}

// Uma partida: placar, tempo, chef e a fase da vez.
function Match({ recipe, game, onReplay }) {
  const [phase, setPhase] = useState("intro");
  const [score, setScore] = useState({ coins: 0, combo: 0, errors: { market: 0, prep: 0, cook: 0 } });
  const [chef, setChef] = useState({ mood: "idle", text: "", n: 0 });
  const [muted, setMuted] = useState(isMuted);
  const stage = useRef(null);
  const combo = useRef(0);
  combo.current = score.combo;

  const index = PHASES.findIndex((p) => p.key === phase);
  const current = PHASES[index];
  const limit = timeLimit(recipe);
  const left = useCountdown(limit, !!current);
  const multiplier = comboMultiplier(score.combo);

  const say = (text, mood = "idle") => setChef((c) => ({ mood, text, n: c.n + 1 }));

  function good(target, text) {
    const gain = 10 * comboMultiplier(combo.current);
    setScore((s) => ({ ...s, coins: s.coins + gain, combo: s.combo + 1 }));
    sfx.good(combo.current);
    pop(target, `+${gain}`);
    say(text, "happy");
  }

  function bad(text, target) {
    setScore((s) => ({ ...s, combo: 0, errors: { ...s.errors, [phase]: s.errors[phase] + 1 } }));
    sfx.bad();
    shake(stage.current);
    if (target) pop(target, "Ops!", "bad");
    say(text, "sad");
  }

  function go(next) {
    setPhase(next?.key ?? "result");
    if (next) say(next.hint);
  }

  // a cada tela nova, o foco vai para o título dela
  useEffect(() => {
    document.getElementById("phase-title")?.focus();
  }, [phase]);

  // o chef volta à cara normal depois de comemorar ou lamentar
  useEffect(() => {
    const timer = setTimeout(() => setChef((c) => ({ ...c, mood: "idle" })), 1500);
    return () => clearTimeout(timer);
  }, [chef.n]);

  useEffect(() => {
    if (left === 0) say("O tempo acabou! Termine o prato, mas sem bônus de tempo.", "sad");
  }, [left]);

  return (
    <div className="game" ref={stage}>
      <header className="hud">
        <Link className="hud-btn" to="/" aria-label="Sair da partida"><Icon name="close" /></Link>
        <div className="hud-title">
          <h1>{game.title}</h1>
          <p>{game.country} · {DIFFICULTY[recipe.difficulty]}</p>
        </div>
        <ol className="hud-phases" aria-label="Fases">
          {PHASES.map((p, n) => (
            <li key={p.key} className={n < index || phase === "result" ? "done" : n === index ? "current" : ""} aria-current={n === index ? "step" : undefined}>
              <span className="phase-num">{n + 1}</span> <span className="phase-name">{p.name}</span>
            </li>
          ))}
        </ol>
        {multiplier > 1 && <p className="hud-combo" key={multiplier}>Combo x{multiplier}</p>}
        <p className="hud-stat" data-low={left <= 20 || undefined} role="timer" aria-label={`Tempo restante: ${clock(left)}`}>
          <Icon name="clock" /> {clock(left)}
          <span className="time-bar" aria-hidden="true"><i style={{ width: `${(left / limit) * 100}%` }} /></span>
        </p>
        <p className="hud-stat" aria-label={`${score.coins} moedas`}>
          <Icon name="coin" /> <span className="bump" key={score.coins}>{score.coins}</span>
        </p>
        <button type="button" className="hud-btn" aria-pressed={muted} aria-label="Silenciar os sons" onClick={() => setMuted(toggleMute())}>
          <Icon name={muted ? "mute" : "sound"} />
        </button>
      </header>

      {current && (
        <>
          <div className="chef-strip">
            <Chef mood={chef.mood} />
            {/* fala do chef: cada jogada é lida pelo leitor de tela */}
            <p className="bubble" aria-live="polite"><span key={chef.n}>{chef.text}</span></p>
          </div>
          <p className="phase-banner" key={phase} aria-hidden="true">
            <small>Fase {index + 1}</small>{current.name}
          </p>
          <current.Phase game={game} recipe={recipe} good={good} bad={bad} say={say} onDone={() => go(PHASES[index + 1])} />
        </>
      )}

      {phase === "intro" && (
        <div className="overlay">
          <section className="panel intro" aria-labelledby="phase-title">
            <h2 id="phase-title" tabIndex={-1} className="panel-title">Novo pedido!</h2>
            <img className="dish-photo" src={recipe.image} alt={`Foto do prato ${recipe.name}`} />
            <p className="order-name">{game.title}</p>
            <p className="muted" lang="en">{recipe.name}</p>
            <ul className="chips" aria-label="Informações">
              <li>{game.country}</li>
              <li>{DIFFICULTY[recipe.difficulty]}</li>
              <li>{clock(limit)} de tempo</li>
            </ul>
            <ol className="phase-preview">
              {PHASES.map((p) => (
                <li key={p.key}><Illustration name={p.art} className="art" />{p.name}</li>
              ))}
            </ol>
            <button type="button" className="btn btn-big" onClick={() => { sfx.good(); go(PHASES[0]); }}>Começar!</button>
          </section>
        </div>
      )}

      {phase === "result" && <ResultPhase recipe={recipe} game={game} score={score} secondsLeft={left} onReplay={onReplay} />}
    </div>
  );
}
