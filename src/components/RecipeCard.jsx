import { Link } from "react-router-dom";
import { DIFFICULTY } from "../data/games";

// `playable`: a receita tem fases prontas, então o card ganha o botão de jogar.
export default function RecipeCard({ recipe, title, playable }) {
  return (
    <article className="recipe-card">
      <img src={recipe.image} alt={`Foto do prato ${recipe.name}`} loading="lazy" />
      <div className="recipe-card-body">
        <h3>{title ?? recipe.name}</h3>
        {title && <p className="muted" lang="en">{recipe.name}</p>}
        <ul className="chips" aria-label="Informações">
          <li>{DIFFICULTY[recipe.difficulty] ?? recipe.difficulty}</li>
          <li>{recipe.cuisine}</li>
          <li>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</li>
        </ul>
        <div className="actions">
          {playable && <Link className="btn btn-big" to={`/jogar/${recipe.id}`}>Jogar</Link>}
          <Link className="btn btn-ghost" to={`/receitas/${recipe.id}`}>Ver receita</Link>
        </div>
      </div>
    </article>
  );
}
