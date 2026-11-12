import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../hooks/useRecipe";
import { games, DIFFICULTY } from "../data/games";
import { missingIngredients, brokenSteps, comboMultiplier } from "../game/rules";
import { sfx, isMuted, toggleMute } from "../game/sound";
import { useMusic } from "../hooks/useMusic";
import { MUSIC, trackFor } from "../data/music";
import { pop } from "../game/fx";
import { THREE } from "../three/kit";
import { minigame } from "../three/games";
import StatusMessage from "../components/StatusMessage";
import Icon from "../components/Icon";
import Chef from "../components/Chef";
import Doily from "../components/Doily";
import Stage3D from "../components/Stage3D";
import MinigamePhase from "../components/MinigamePhase";
import ResultPhase from "../components/ResultPhase";

// A feira é igual para todo pedido; as outras duas fases têm nome e dica da receita.
const phasesOf = (game) => [
  { key: "market", name: "Mercado", hint: "Primeiro, as compras! Pegue só o que está na lista." },
  { key: "prep", ...game.phases.prep },
  { key: "cook", ...game.phases.cook },
];

export default function Play() {
  const { id } = useParams();
  const game = games[id];
  const { status, recipe, error, retry } = useRecipe(id);
  const [round, setRound] = useState(0);
  // a trilha do pedido já toca enquanto a receita carrega; a partida troca a cada fase
  useMusic(MUSIC.order);

  let problem = null;
  if (!game) {
    problem = <StatusMessage status="error">Esta receita ainda não tem fases prontas.</StatusMessage>;
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
  // cada partida monta uma cozinha 3D nova: jogar de novo começa tudo limpo
  return <Match key={round} recipe={recipe} game={game} onReplay={() => setRound((r) => r + 1)} />;
}

// Uma partida: placar, chef e a fase da vez, por cima do palco 3D.
function Match({ recipe, game, onReplay }) {
  const [world, setWorld] = useState(null);
  const [failed, setFailed] = useState(null);
  const [phase, setPhase] = useState("intro");
  const [score, setScore] = useState({ coins: 0, combo: 0 });
  const [steps, setSteps] = useState([]);
  const [chef, setChef] = useState({ mood: "idle", text: "", n: 0 });
  const [muted, setMuted] = useState(isMuted);
  const [leaving, setLeaving] = useState(false);
  const comboRef = useRef(0);

  const PHASES = phasesOf(game);
  const index = PHASES.findIndex((p) => p.key === phase);
  const current = PHASES[index];
  const multiplier = comboMultiplier(score.combo);
  const total = Object.values(game.play).reduce((n, list) => n + list.length, 0);

  // no resultado quem escolhe a faixa é o ResultPhase, que sabe as estrelas
  useMusic(phase === "result" ? null : trackFor(phase === "intro" ? "order" : phase, recipe.id));

  const say = (text, mood = "idle") => setChef((c) => ({ mood, text, n: c.n + 1 }));

  // o combo vive num ref também: vários acertos no mesmo quadro somam certo
  function good(point, text) {
    const combo = comboRef.current++;
    const gain = 10 * comboMultiplier(combo);
    setScore((s) => ({ coins: s.coins + gain, combo: s.combo + 1 }));
    pop(point, `+${gain}`);
    sfx.good(combo);
    say(text, "happy");
  }

  function bad(point, text) {
    comboRef.current = 0;
    setScore((s) => ({ ...s, combo: 0 }));
    sfx.bad();
    pop(point, "Ops!", "bad");
    say(text, "sad");
  }

  function go(next) {
    setPhase(next?.key ?? "result");
    if (next) say(next.hint);
  }

  // câmera de abertura gira pela cozinha; no fim, gira em volta do prato pronto
  useEffect(() => {
    if (!world) return;
    if (phase === "intro") world.orbit(new THREE.Vector3(1.5, 1.4, 0), 15, 6, 0.06, 40);
    if (phase === "result") {
      // o prato pronto: onde a última etapa deixou (ou o prato da estação de servir)
      const { center, radius } = world.dish.hero ?? { center: new THREE.Vector3(9, 0.6, 0.3), radius: 5.4 };
      world.orbit(center, radius, 2.8, 0.18, 30);
    }
  }, [world, phase]);

  useEffect(() => {
    document.getElementById("phase-title")?.focus();
  }, [phase]);

  // miniaturas do pedido: a própria cozinha 3D fotografa onde cada fase começa
  const [thumbs, setThumbs] = useState(null);
  useEffect(() => {
    if (!world) return;
    setThumbs(PHASES.map(({ key }) => {
      const spec = game.play[key][0];
      return world.snapshot(spec.shot ?? minigame(spec.game).shot);
    }));
  }, [world]); // uma foto por cozinha: o pedido não muda durante a partida

  // o chef volta à cara normal depois de comemorar ou lamentar
  useEffect(() => {
    const timer = setTimeout(() => setChef((c) => ({ ...c, mood: "idle" })), 1500);
    return () => clearTimeout(timer);
  }, [chef.n]);

  return (
    <div className="game">
      <Stage3D onReady={setWorld} onError={setFailed} />

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
        <p className="hud-stat" aria-label={`${score.coins} moedas`}>
          <Icon name="coin" /> <span className="bump" key={score.coins}>{score.coins}</span>
        </p>
        <button type="button" className="hud-btn" aria-pressed={muted} aria-label="Silenciar os sons" onClick={() => setMuted(toggleMute())}>
          <Icon name={muted ? "mute" : "sound"} />
        </button>
      </header>

      {current && world && (
        <>
          <div className="chef-strip">
            <Chef mood={chef.mood} />
            {/* fala do chef: cada jogada é lida pelo leitor de tela */}
            <p className="bubble" aria-live="polite"><span key={chef.n}>{chef.text}</span></p>
          </div>
          <p className="phase-banner" key={`banner-${phase}`} aria-hidden="true">
            <small>Fase {index + 1}</small>{current.name}
          </p>
          <h2 id="phase-title" tabIndex={-1} className="visually-hidden">Fase {index + 1}: {current.name}</h2>
          <MinigamePhase
            key={phase}
            world={world} specs={game.play[phase]} game={game} recipe={recipe} combo={multiplier}
            good={good} bad={bad} say={say}
            onStep={(step) => setSteps((list) => [...list, step])}
            onDone={() => go(PHASES[index + 1])}
          />
        </>
      )}

      {phase === "intro" && (
        <div className="overlay overlay-scene" data-leaving={leaving || undefined}>
          <section className="panel intro" aria-labelledby="phase-title">
            <h2 id="phase-title" tabIndex={-1} className="panel-title">Novo pedido!</h2>
            <Doily src={recipe.image} alt={`Foto do prato ${recipe.name}`} />
            <p className="order-name">{game.title}</p>
            <p className="muted" lang="en">{recipe.name}</p>
            <ul className="chips" aria-label="Informações">
              <li>{game.country}</li>
              <li>{DIFFICULTY[recipe.difficulty]}</li>
              <li>{total} etapas</li>
            </ul>
            <h3 className="how-title">Como vai ser</h3>
            <ol className="phase-preview">
              {PHASES.map((p, n) => (
                <li key={p.key}>
                  <span className="phase-thumb">{thumbs && <img src={thumbs[n]} alt="" />}</span>
                  <small>Fase {n + 1}</small>{p.name}
                </li>
              ))}
            </ol>
            {failed ? (
              <StatusMessage status="error">Este aparelho não conseguiu abrir a cozinha 3D (WebGL). {failed.message}</StatusMessage>
            ) : world ? (
              <button type="button" className="btn btn-big" disabled={leaving} onClick={() => {
                sfx.start();
                setLeaving(true);
                // um relógio, não o fim da animação: sem animação (movimento reduzido) o evento nunca vem
                setTimeout(() => go(PHASES[0]), 400);
              }}>Começar!</button>
            ) : (
              <StatusMessage status="loading">Arrumando a cozinha…</StatusMessage>
            )}
          </section>
        </div>
      )}

      {phase === "result" && <ResultPhase recipe={recipe} coins={score.coins} steps={steps} onReplay={onReplay} />}
    </div>
  );
}
