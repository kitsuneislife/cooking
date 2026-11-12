import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../hooks/useRecipe";
import { games, DIFFICULTY } from "../data/games";
import StatusMessage from "../components/StatusMessage";
import { useMusic } from "../hooks/useMusic";
import { MUSIC } from "../data/music";

export default function RecipeDetail() {
  useMusic(MUSIC.menu);
  const { id } = useParams();
  const { status, recipe, error, retry } = useRecipe(id);
  const game = games[id];

  if (status === "loading") return <StatusMessage status="loading">Buscando a receita na API…</StatusMessage>;
  if (status === "error") {
    return <StatusMessage status="error" onRetry={retry}>Não deu para carregar a receita. {error.message}</StatusMessage>;
  }

  return (
    <article className="page detail">
      <div className="detail-head">
        <img className="detail-photo" src={recipe.image} alt={`Foto do prato ${recipe.name}`} />
        <h1>{game?.title ?? recipe.name}</h1>
        {game && <p className="muted" lang="en">{recipe.name}</p>}
        <ul className="chips" aria-label="Informações">
          <li>{DIFFICULTY[recipe.difficulty] ?? recipe.difficulty}</li>
          <li>{recipe.cuisine}</li>
          <li>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</li>
          <li>{recipe.servings} porções</li>
          <li>Nota {recipe.rating}</li>
        </ul>
        {game
          ? <Link className="btn btn-big" to={`/jogar/${recipe.id}`}>Cozinhar</Link>
          : <p>Esta receita ainda não está na demo.</p>}
      </div>
      <section>
        <h2>Ingredientes</h2>
        <ul lang="en">{recipe.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
      </section>
      <section>
        <h2>Modo de preparo</h2>
        <ol lang="en">{recipe.instructions.map((s) => <li key={s}>{s}</li>)}</ol>
      </section>
    </article>
  );
}
