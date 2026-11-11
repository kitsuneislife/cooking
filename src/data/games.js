// Camada do jogo: o que a API não tem (tradução, desenho, corte, estação).
// Cada ingrediente se liga à API pelo texto exato de `ingredients[]` (campo `api`).
// Fonte: docs/cozinha/ingredientes.md, estacoes.md e preparo.md.

export const DEMO_ID = 8;

export const DIFFICULTY = { Easy: "Fácil", Medium: "Média" };

export const CUTS = ["Picado fino", "Picado", "Em cubos", "Fatiado", "Ralado"];

// Estação -> nome do desenho em src/art.
export const STATIONS = {
  Tábua: "board",
  Tigela: "mixingBowl",
  Fogão: "stove",
  Forno: "oven",
  Servir: "serve",
};

// Uma receita nova é só mais uma entrada aqui (e os desenhos que faltarem em src/art).
// Cada passo diz a estação, o que entra nela (`add`), a ação do jogador (`action`)
// e o que sai pronto para a bandeja (`makes`, descrito em `products`).
// Ações: { type: "tap", taps } = tocar várias vezes; { type: "timer", seconds } = tirar no ponto.
export const games = {
  8: {
    title: "Carne com brócolis no wok",
    country: "China",
    ingredients: [
      { id: "beef", api: "Beef sirloin, thinly sliced", name: "Contrafilé", cut: "Fatiado" },
      { id: "broccoli", api: "Broccoli florets", name: "Brócolis" },
      { id: "soy", api: "Soy sauce", name: "Shoyu" },
      { id: "oyster", api: "Oyster sauce", name: "Molho de ostra" },
      { id: "sesame", api: "Sesame oil", name: "Óleo de gergelim" },
      { id: "garlic", api: "Garlic, minced", name: "Alho", cut: "Picado fino" },
      { id: "ginger", api: "Ginger, minced", name: "Gengibre", cut: "Picado fino" },
      { id: "cornstarch", api: "Cornstarch", name: "Amido de milho" },
      { id: "rice", api: "Cooked white rice for serving", name: "Arroz cozido" },
    ],
    // Intrusos da mesma categoria dos ingredientes certos, para confundir.
    intruders: [
      { id: "shrimp", name: "Camarão" },
      { id: "tofu", name: "Tofu" },
      { id: "carrot", name: "Cenoura" },
      { id: "mushroom", name: "Shiitake" },
      { id: "teriyaki", name: "Molho teriyaki" },
    ],
    products: { sauce: "Molho", seared: "Carne selada", stirfry: "Refogado" },
    steps: [
      {
        text: "Preparar o molho", station: "Tigela",
        add: ["soy", "oyster", "sesame", "cornstarch"],
        action: { type: "tap", label: "Misturar", taps: 6 }, makes: "sauce",
      },
      {
        text: "Selar a carne no wok", station: "Fogão",
        add: ["beef"],
        action: { type: "timer", label: "Tirar do fogo", seconds: 5 }, makes: "seared",
      },
      {
        text: "Saltear brócolis, alho e gengibre", station: "Fogão",
        add: ["broccoli", "garlic", "ginger"],
        action: { type: "tap", label: "Saltear", taps: 6 },
      },
      { text: "Voltar a carne e juntar o molho", station: "Fogão", add: ["seared", "sauce"] },
      {
        text: "Mexer até envolver tudo", station: "Fogão",
        add: [],
        action: { type: "tap", label: "Mexer", taps: 8 }, makes: "stirfry",
      },
      { text: "Servir sobre o arroz", station: "Servir", add: ["rice", "stirfry"] },
    ],
  },
};
