import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../hooks/useRecipe";
import { games } from "../data/games";
import { localize, useLang } from "../i18n";
import StatusMessage from "../components/StatusMessage";
import Doily from "../components/Doily";
import { useMusic } from "../hooks/useMusic";
import { MUSIC } from "../data/music";

// A receita aberta como um caderno: foto e ficha à esquerda, ingredientes e preparo à direita.
// Tudo vem da API. Em português entra a tradução da receita e, nas receitas do jogo,
// a camada do jogo por cima (nomes, corte, estação), com o texto original embaixo.
// Em inglês a receita aparece como veio da API.
export default function RecipeDetail() {
  useMusic(MUSIC.menu);
  const { id } = useParams();
  const { status, recipe, error, retry } = useRecipe(id);
  const { lang, t } = useLang();
  const pt = lang === "pt";
  const game = games[id];
  const overlay = pt ? game : undefined;

  if (status === "loading") return <StatusMessage status="loading">{t.loadingRecipe}</StatusMessage>;
  if (status === "error") {
    return <StatusMessage status="error" onRetry={retry}>{t.errorRecipe} {error.message}</StatusMessage>;
  }

  const shown = localize(recipe, lang);
  const title = overlay?.title ?? shown.name;
  const stages = game && Object.values(game.play).reduce((n, list) => n + list.length, 0);
  const facts = [
    [t.prep, `${recipe.prepTimeMinutes} min`],
    [t.cook, `${recipe.cookTimeMinutes} min`],
    [t.servings, recipe.servings],
    [t.calories, `${recipe.caloriesPerServing} kcal`],
    [t.level, shown.difficulty],
    [overlay ? t.country : t.cuisine, overlay?.country ?? shown.cuisine],
  ];

  return (
    <article className="book" aria-labelledby="recipe-title">
      <header className="book-title">
        <h1 id="recipe-title" className="ribbon">{title}</h1>
        {title !== recipe.name && <p lang="en">{recipe.name}</p>}
      </header>

      {/* as folhas rolam por dentro: com tabIndex dá para focar e rolar com as setas, sem mouse */}
      <div className="leaf leaf-left" tabIndex={0} role="region" aria-labelledby="recipe-title">
        <Doily className="doily-big" src={recipe.image} alt={t.photo(title)} />
        <p className="score-line">
          <span className="meter-stars" style={{ "--v": recipe.rating / 5 }} role="img" aria-label={t.score(recipe.rating)} />
          <b>{recipe.rating}</b> <span>· {recipe.reviewCount} {t.reviews}</span>
        </p>
        <dl className="facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <ul className="chips tags" aria-label={t.tags}>
          {shown.mealType.map((m) => <li key={m} className="chip-meal">{m}</li>)}
          {overlay && <li>{shown.cuisine}</li>}
          {shown.tags.map((tag) => <li key={tag}>#{tag}</li>)}
        </ul>
        {game ? (
          <div className="cook-cta">
            <Link className="btn btn-big" to={`/jogar/${recipe.id}`}>{t.cookNow}</Link>
            <p>{t.stages(stages)}</p>
          </div>
        ) : <p className="cook-cta">{t.notInGame}</p>}
      </div>

      <div className="rings" aria-hidden="true" />

      <div className="leaf leaf-right" tabIndex={0} role="region" aria-labelledby="ing-title steps-title">
        <section aria-labelledby="ing-title">
          <h2 id="ing-title" className="leaf-head">{t.ingredients} <small>{recipe.ingredients.length}</small></h2>
          <ul className="ingredients">
            {recipe.ingredients.map((text, n) => {
              const item = overlay?.ingredients.find((i) => i.api === text);
              return (
                <li key={text}>
                  {item ? (
                    <>
                      <b>{item.name}</b>{item.cut && <span className="cut">{item.cut}</span>}
                      <small lang="en">{text}</small>
                    </>
                  ) : <b>{shown.ingredients[n]}</b>}
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="steps-title">
          <h2 id="steps-title" className="leaf-head">{t.steps} <small>{t.stepsCount(recipe.instructions.length)}</small></h2>
          <ol className="steps">
            {recipe.instructions.map((text, n) => {
              const step = overlay?.steps[n];
              return (
                <li key={text}>
                  {step ? (
                    <>
                      <b>{step.text}</b><span className="station">{step.station}</span>
                      <small>{shown.instructions[n]}</small>
                    </>
                  ) : <b>{shown.instructions[n]}</b>}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </article>
  );
}
