import { createContext, useContext, useEffect, useState } from "react";
import RECIPES_PT from "./data/recipes-pt.json";
import Switch from "./components/Switch";

// Idioma das telas de menu e receita. Começa sempre em português (não fica salvo);
// em inglês o app mostra a receita como veio da API. A partida continua em português.

const UI = {
  pt: {
    recipes: "Receitas", today: "Pedidos do dia", catalog: "Catálogo",
    play: "Jogar", recipe: "Receita", rating: (r) => `Nota ${r} na API`, photo: (n) => `Foto do prato ${n}`, info: "Informações",
    bubble: "Escolha um pedido e vamos cozinhar juntos!", tagline: "Um jogo de cozinha com receitas de verdade.",
    loadingOrder: (n) => `Buscando ${n}…`, errorOrder: (n) => `Não deu para carregar ${n}.`,
    loadingCatalog: "Buscando o catálogo…", errorCatalog: "Não deu para carregar o catálogo.", catalogCount: (n) => `${n} receitas no catálogo`,
    loadingRecipe: "Buscando a receita na API…", errorRecipe: "Não deu para carregar a receita.", retry: "Tentar de novo",
    prep: "Preparo", cook: "No fogo", servings: "Porções", calories: "Calorias", level: "Nível", country: "País", cuisine: "Cozinha",
    score: (r) => `Nota ${r} de 5`, reviews: "avaliações", tags: "Etiquetas",
    cookNow: "Cozinhar!", stages: (n) => `3 fases · ${n} etapas`, notInGame: "Esta receita ainda não está no jogo.",
    ingredients: "Ingredientes", steps: "Modo de preparo", stepsCount: (n) => `${n} passos`,
    home: "Voltar ao início", skip: "Pular para o conteúdo", footer: "Seis pedidos para cozinhar.", footerFrom: "Receitas da",
    language: "Idioma",
  },
  en: {
    recipes: "Recipes", today: "Today's orders", catalog: "Catalog",
    play: "Play", recipe: "Recipe", rating: (r) => `Rated ${r} on the API`, photo: (n) => `Photo of ${n}`, info: "Details",
    bubble: "Pick an order and let's cook together!", tagline: "A cooking game with real recipes.",
    loadingOrder: (n) => `Fetching ${n}…`, errorOrder: (n) => `Could not load ${n}.`,
    loadingCatalog: "Fetching the catalog…", errorCatalog: "Could not load the catalog.", catalogCount: (n) => `${n} recipes in the catalog`,
    loadingRecipe: "Fetching the recipe from the API…", errorRecipe: "Could not load the recipe.", retry: "Try again",
    prep: "Prep", cook: "Cook", servings: "Servings", calories: "Calories", level: "Level", country: "Country", cuisine: "Cuisine",
    score: (r) => `Rated ${r} out of 5`, reviews: "reviews", tags: "Tags",
    cookNow: "Cook!", stages: (n) => `3 phases · ${n} steps`, notInGame: "This recipe is not in the game yet.",
    ingredients: "Ingredients", steps: "Directions", stepsCount: (n) => `${n} steps`,
    home: "Back to the start", skip: "Skip to content", footer: "Six orders to cook.", footerFrom: "Recipes from",
    language: "Language",
  },
};

const CUISINE = {
  American: "Americana", Asian: "Asiática", Brazilian: "Brasileira", Cocktail: "Drinque", Greek: "Grega",
  Hawaiian: "Havaiana", Indian: "Indiana", Italian: "Italiana", Japanese: "Japonesa", Korean: "Coreana",
  Lebanese: "Libanesa", Mediterranean: "Mediterrânea", Mexican: "Mexicana", Moroccan: "Marroquina",
  Pakistani: "Paquistanesa", Russian: "Russa", Smoothie: "Vitamina", Spanish: "Espanhola", Thai: "Tailandesa",
  Turkish: "Turca", Vietnamese: "Vietnamita",
};

const MEAL = {
  Breakfast: "Café da manhã", Lunch: "Almoço", Dinner: "Jantar", Snack: "Lanche", Snacks: "Lanche",
  Dessert: "Sobremesa", Beverage: "Bebida", Appetizer: "Entrada", "Side Dish": "Acompanhamento",
};

// etiquetas genéricas; nome de prato (Biryani, Tiramisu…) fica como veio
const TAG = {
  Asian: "Asiática", Baking: "Forno", Banana: "Banana", Beef: "Carne", Brazilian: "Brasileira", Chicken: "Frango",
  "Chicken skewers": "Espetinho de frango", Chickpea: "Grão-de-bico", "Chickpea salad": "Salada de grão-de-bico",
  Cocktail: "Drinque", Coconut: "Coco", Cookies: "Cookies", "Couscous salad": "Salada de cuscuz", Cuban: "Cubana",
  Dessert: "Sobremesa", Greek: "Grega", Grilling: "Grelhado", Hawaiian: "Havaiana", Indian: "Indiana",
  Italian: "Italiana", Japanese: "Japonesa", Kebabs: "Kebab", Korean: "Coreana", Lebanese: "Libanesa",
  "Main course": "Prato principal", Mango: "Manga", "Mango salsa": "Salsa de manga", "Margherita pizza": "Pizza margherita",
  "Matcha ice cream": "Sorvete de matchá", Mediterranean: "Mediterrânea", Mexican: "Mexicana", Moroccan: "Marroquina",
  Pakistani: "Paquistanesa", Pasta: "Massa", "Pesto pasta": "Macarrão ao pesto", Pineapple: "Abacaxi", Potatoes: "Batata",
  Quick: "Rápida", "Quinoa salad": "Salada de quinoa", Rice: "Arroz", Russian: "Russa", Salad: "Salada",
  Shrimp: "Camarão", "Shrimp curry": "Curry de camarão", "Shrimp stir-fry": "Camarão salteado", Smoothie: "Vitamina",
  Soup: "Sopa", Spanish: "Espanhola", "Spring rolls": "Rolinho primavera", "Stir-fry": "Salteado",
  "Street food": "Comida de rua", "Sushi rolls": "Sushi", "Teriyaki chicken": "Frango teriyaki", Thai: "Tailandesa",
  Turkish: "Turca", Vegetarian: "Vegetariana", Vietnamese: "Vietnamita", Wrap: "Wrap",
};
const DIFFICULTY = { Easy: "Fácil", Medium: "Média" };

// A receita da API no idioma escolhido. Em inglês volta como veio; em português troca
// o que tiver tradução e deixa o resto como está.
export function localize(recipe, lang) {
  if (lang !== "pt" || !recipe) return recipe;
  const pt = RECIPES_PT[recipe.id];
  return {
    ...recipe,
    ...(pt && { name: pt.name }),
    ...(pt && recipe.ingredients && { ingredients: pt.ingredients }),
    ...(pt && recipe.instructions && { instructions: pt.instructions }),
    cuisine: CUISINE[recipe.cuisine] ?? recipe.cuisine,
    difficulty: DIFFICULTY[recipe.difficulty] ?? recipe.difficulty,
    ...(recipe.mealType && { mealType: recipe.mealType.map((m) => MEAL[m] ?? m) }),
    ...(recipe.tags && { tags: recipe.tags.map((t) => TAG[t] ?? t) }),
  };
}

const LangContext = createContext({ lang: "pt", setLang: () => {}, t: UI.pt });

export function LangProvider({ children }) {
  const [lang, setLang] = useState("pt");
  useEffect(() => { document.documentElement.lang = lang === "pt" ? "pt-BR" : "en"; }, [lang]);
  return <LangContext.Provider value={{ lang, setLang, t: UI[lang] }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

// Seletor BR / EN: a pílula de opções (components/Switch) com os dois idiomas.
const LANGS = [
  { id: "pt", label: "BR", name: "Português", lang: "pt-BR" },
  { id: "en", label: "EN", name: "English", lang: "en" },
];

export function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return <Switch className="lang-switch" label={t.language} value={lang} options={LANGS} onChange={setLang} />;
}
