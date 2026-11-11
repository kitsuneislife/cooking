import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import StatusMessage from "./StatusMessage";
import Icon from "./Icon";
import { starsFor, finalScore, average, stepGrade } from "../game/rules";
import { rateRecipe } from "../services/recipes";
import { sfx } from "../game/sound";
import { confetti } from "../game/fx";

// `steps`: a nota (0 a 1) e o tempo que sobrou em cada etapa jogada.
export default function ResultPhase({ recipe, game, coins, steps, onReplay }) {
  const stars = starsFor(average(steps.map((s) => s.score)));
  const secondsLeft = steps.reduce((n, s) => n + s.spare, 0);
  const { timeBonus, total } = finalScore({ coins, secondsLeft, difficulty: recipe.difficulty });
  const [rating, setRating] = useState(0);
  const [send, setSend] = useState({ status: "idle" });

  useEffect(() => {
    if (!stars) return;
    sfx.win();
    confetti();
  }, [stars]);

  async function submit(e) {
    e.preventDefault();
    if (!rating) {
      setSend({ status: "error", message: "Escolha de 1 a 5 estrelas antes de enviar." });
      return;
    }
    setSend({ status: "loading" });
    try {
      const updated = await rateRecipe(recipe.id, rating);
      setSend({ status: "success", updated });
    } catch (err) {
      setSend({ status: "error", message: `Não deu para enviar a nota. ${err.message}` });
    }
  }

  return (
    <div className="overlay overlay-scene overlay-side">
      <section className="panel result" aria-labelledby="phase-title">
        <h2 id="phase-title" tabIndex={-1} className="panel-title">{stars ? "Prato pronto!" : "Quase lá…"}</h2>
        <StarRating value={stars} max={3} />

        <div className="result-body">
          <img className="dish-photo" src={recipe.image} alt={`Foto do prato ${recipe.name}`} />
          <div>
            <table className="score-table">
              <caption className="visually-hidden">Pontuação</caption>
              <tbody>
                <tr><th scope="row">Moedas da partida</th><td>{coins}</td></tr>
                <tr><th scope="row">Bônus de tempo ({secondsLeft}s)</th><td>+{timeBonus}</td></tr>
                {recipe.difficulty === "Medium" && <tr><th scope="row">Receita média</th><td>x1,5</td></tr>}
                <tr className="score-total"><th scope="row">Total</th><td><Icon name="coin" /> {total}</td></tr>
              </tbody>
            </table>
            <ol className="grades" aria-label="Nota de cada etapa">
              {steps.map((s, n) => {
                const g = stepGrade(s.score);
                return <li key={n} data-grade={g.key}><span>{s.title}</span> <b>{g.label}</b></li>;
              })}
            </ol>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onReplay}>Jogar de novo</button>
          <Link className="btn btn-ghost" to="/">Voltar ao início</Link>
        </div>

        <form className="rate-form" onSubmit={submit}>
          <StarRating value={rating} onChange={setRating} label="Que nota você dá para esta receita?" />
          <button type="submit" className="btn btn-small" disabled={send.status === "loading"}>Enviar nota</button>
          {send.status === "loading" && <StatusMessage status="loading">Enviando a nota…</StatusMessage>}
          {send.status === "error" && <StatusMessage status="error">{send.message}</StatusMessage>}
          {send.status === "success" && (
            <StatusMessage status="success">
              A API recebeu a nota {send.updated.rating} para "{send.updated.name}". (A DummyJSON só simula: nada fica salvo.)
            </StatusMessage>
          )}
        </form>

        <details className="full-recipe">
          <summary>Receita completa</summary>
          <h3>Ingredientes</h3>
          <ul>
            {game.ingredients.map((i) => (
              <li key={i.id}>{i.name} <span className="muted" lang="en">({i.api})</span></li>
            ))}
          </ul>
          <h3>Modo de preparo</h3>
          <ol>
            {game.steps.map((s, n) => (
              <li key={n}>
                {s.text} <span className="chip">{s.station}</span>
                <p className="muted" lang="en">{recipe.instructions[n]}</p>
              </li>
            ))}
          </ol>
        </details>
      </section>
    </div>
  );
}
