import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../hooks/useRecipe";
import { games, DIFFICULTY } from "../data/games";
import StatusMessage from "../components/StatusMessage";
import Doily from "../components/Doily";
import { useMusic } from "../hooks/useMusic";
import { MUSIC } from "../data/music";

// refeições da API em português; um valor novo da API aparece como veio
const MEAL = {
  Breakfast: "Café da manhã", Lunch: "Almoço", Dinner: "Jantar", Snack: "Lanche", Snacks: "Lanche",
  Dessert: "Sobremesa", Beverage: "Bebida", Appetizer: "Entrada", "Side Dish": "Acompanhamento",
};

// A receita aberta como um caderno: foto e ficha à esquerda, ingredientes e preparo à direita.
// Tudo vem da API; o que é do jogo (nomes em português, corte, estação) entra por cima quando existe.
export default function RecipeDetail() {
  useMusic(MUSIC.menu);
  const { id } = useParams();
  const { status, recipe, error, retry } = useRecipe(id);
  const game = games[id];

  if (status === "loading") return <StatusMessage status="loading">Buscando a receita na API…</StatusMessage>;
  if (status === "error") {
    return <StatusMessage status="error" onRetry={retry}>Não deu para carregar a receita. {error.message}</StatusMessage>;
  }

  const stages = game && Object.values(game.play).reduce((n, list) => n + list.length, 0);
  const facts = [
    ["Preparo", `${recipe.prepTimeMinutes} min`],
    ["No fogo", `${recipe.cookTimeMinutes} min`],
    ["Porções", recipe.servings],
    ["Calorias", `${recipe.caloriesPerServing} kcal`],
    ["Nível", DIFFICULTY[recipe.difficulty] ?? recipe.difficulty],
    [game ? "País" : "Cozinha", game?.country ?? recipe.cuisine],
  ];

  return (
    <article className="book" aria-labelledby="recipe-title">
      <header className="book-title">
        <h1 id="recipe-title" className="ribbon">{game?.title ?? recipe.name}</h1>
        {game && <p lang="en">{recipe.name}</p>}
      </header>

      <div className="leaf leaf-left">
        <Doily className="doily-big" src={recipe.image} alt={`Foto do prato ${recipe.name}`} />
        <p className="score-line">
          <span className="meter-stars" style={{ "--v": recipe.rating / 5 }} role="img" aria-label={`Nota ${recipe.rating} de 5`} />
          <b>{recipe.rating}</b> <span>· {recipe.reviewCount} avaliações</span>
        </p>
        <dl className="facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <ul className="chips tags" aria-label="Etiquetas">
          {recipe.mealType.map((m) => <li key={m} className="chip-meal">{MEAL[m] ?? m}</li>)}
          {game && <li lang="en">{recipe.cuisine}</li>}
          {recipe.tags.map((t) => <li key={t} lang="en">#{t}</li>)}
        </ul>
        {game ? (
          <div className="cook-cta">
            <Link className="btn btn-big" to={`/jogar/${recipe.id}`}>Cozinhar!</Link>
            <p>3 fases · {stages} etapas</p>
          </div>
        ) : <p className="cook-cta">Esta receita ainda não está no jogo.</p>}
      </div>

      <div className="rings" aria-hidden="true" />

      <div className="leaf leaf-right">
        <section aria-labelledby="ing-title">
          <h2 id="ing-title" className="leaf-head">Ingredientes <small>{recipe.ingredients.length}</small></h2>
          <ul className="ingredients">
            {recipe.ingredients.map((text) => {
              const item = game?.ingredients.find((i) => i.api === text);
              return (
                <li key={text}>
                  {item ? (
                    <>
                      <b>{item.name}</b>{item.cut && <span className="cut">{item.cut}</span>}
                      <small lang="en">{text}</small>
                    </>
                  ) : <b lang="en">{text}</b>}
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="steps-title">
          <h2 id="steps-title" className="leaf-head">Modo de preparo <small>{recipe.instructions.length} passos</small></h2>
          <ol className="steps">
            {recipe.instructions.map((text, n) => {
              const step = game?.steps[n];
              return (
                <li key={text}>
                  {step ? (
                    <>
                      <b>{step.text}</b><span className="station">{step.station}</span>
                      <small lang="en">{text}</small>
                    </>
                  ) : <b lang="en">{text}</b>}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </article>
  );
}
