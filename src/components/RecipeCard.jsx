import { Link } from "react-router-dom";
import { DIFFICULTY } from "../data/games";
import Doily from "./Doily";

// Um pedido do cardápio: a foto da API numa toalhinha de renda e o nome numa fita adesiva.
// `n` escolhe a cor do papel (ver `.order` em styles.css).
export default function RecipeCard({ recipe, game, n = 0 }) {
  return (
    <article className="order" style={{ "--n": n }}>
      <p className="order-rating" aria-label={`Nota ${recipe.rating} na API`}>★ {recipe.rating}</p>
      <Doily src={recipe.image} alt={`Foto do prato ${recipe.name}`} />
      <h3 className="tape">{game.title}</h3>
      <p className="order-en" lang="en">{recipe.name}</p>
      <ul className="chips" aria-label="Informações">
        <li>{game.country}</li>
        <li>{DIFFICULTY[recipe.difficulty] ?? recipe.difficulty}</li>
        <li>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</li>
      </ul>
      <div className="actions">
        <Link className="btn" to={`/jogar/${recipe.id}`}>Jogar</Link>
        <Link className="btn btn-ghost" to={`/receitas/${recipe.id}`}>Receita</Link>
      </div>
    </article>
  );
}
