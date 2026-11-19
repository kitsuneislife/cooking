import { Link } from "react-router-dom";
import { localize, useLang } from "../i18n";
import Doily from "./Doily";

// Um pedido do cardápio: a foto da API numa toalhinha de renda e o nome numa fita adesiva.
// `n` escolhe a cor do papel (ver `.order` em styles.css).
// Sem `game` (receita do catálogo, fora do jogo) o cartão mostra só o botão Receita.
// Em português o nome original da API aparece embaixo, menor.
export default function RecipeCard({ recipe, game, n = 0 }) {
  const { lang, t } = useLang();
  const pt = lang === "pt";
  const shown = localize(recipe, lang);
  const title = pt ? (game?.title ?? shown.name) : recipe.name;
  return (
    <article className="order" style={{ "--n": n }}>
      <p className="order-rating" aria-label={t.rating(recipe.rating)}>★ {recipe.rating}</p>
      <Doily src={recipe.image} alt={t.photo(title)} />
      <h3 className="tape">{title}</h3>
      {pt && title !== recipe.name && <p className="order-en" lang="en">{recipe.name}</p>}
      <ul className="chips" aria-label={t.info}>
        <li>{pt ? (game?.country ?? shown.cuisine) : recipe.cuisine}</li>
        <li>{shown.difficulty}</li>
        <li>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</li>
      </ul>
      <div className="actions">
        {game && <Link className="btn" to={`/jogar/${recipe.id}`}>{t.play}</Link>}
        <Link className="btn btn-ghost" to={`/receitas/${recipe.id}`}>{t.recipe}</Link>
      </div>
    </article>
  );
}
