// Camada do jogo: o que a API não tem (tradução, desenho, corte, estação).
// Cada ingrediente se liga à API pelo texto exato de `ingredients[]` (campo `api`).
// Fonte: docs/cozinha/ingredientes.md, estacoes.md e preparo.md.

export const DEMO_ID = 8;

export const DIFFICULTY = { Easy: "Fácil", Medium: "Média" };

// Uma receita nova é só mais uma entrada aqui (e os modelos que faltarem em src/three/kit.js).
// `steps` é o modo de preparo, na ordem da API: a estação, o que entra nela (`add`)
// e o que sai pronto (`makes`, descrito em `products`).
// `play` diz quais minijogos 3D cada fase joga (ver src/three/games), com os ingredientes
// (`items`) e o passo da receita (`step`) que cada um encena.
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
      { text: "Preparar o molho", station: "Tigela", add: ["soy", "oyster", "sesame", "cornstarch"], makes: "sauce" },
      { text: "Selar a carne no wok", station: "Fogão", add: ["beef"], makes: "seared" },
      { text: "Saltear brócolis, alho e gengibre", station: "Fogão", add: ["broccoli", "garlic", "ginger"] },
      { text: "Voltar a carne e juntar o molho", station: "Fogão", add: ["seared", "sauce"] },
      { text: "Mexer até envolver tudo", station: "Fogão", add: [], makes: "stirfry" },
      { text: "Servir sobre o arroz", station: "Servir", add: ["rice", "stirfry"] },
    ],
    play: {
      market: [{ game: "shop" }],
      prep: [
        { game: "slice", items: ["beef"] },
        { game: "mince", items: ["garlic", "ginger"] },
        { game: "pour", step: 0, items: ["soy", "oyster", "sesame", "cornstarch"] },
        { game: "whisk", step: 0 },
      ],
      cook: [
        { game: "fry", step: 1, items: ["beef"] },
        { game: "toss", step: 2, items: ["broccoli", "garlic", "ginger"] },
        { game: "stir", step: 3 },
        { game: "plate", step: 5, items: ["rice"] },
      ],
    },
  },
};
