// Camada do jogo: o que a API não tem (tradução, desenho, corte, estação).
// Cada ingrediente se liga à API pelo texto exato de `ingredients[]` (campo `api`).
// Fonte: docs/cozinha/ingredientes.md, estacoes.md e preparo.md.

export const DIFFICULTY = { Easy: "Fácil", Medium: "Média" };

// Uma receita nova é só mais uma entrada aqui (e os modelos que faltarem em src/three/foods.js).
// `steps` é o modo de preparo, na ordem da API: a estação, o que entra nela (`add`)
// e o que sai pronto (`makes`, descrito em `products`).
// `phases` dá nome e dica às duas fases depois da feira (cada receita usa estações diferentes).
// `play` diz quais minijogos 3D cada fase joga (ver src/three/games), com os ingredientes
// (`items`) e o passo da receita (`step`) que cada um encena. O resto de cada etapa são
// ajustes do minijogo; `title`, `how`, `keys`, `shot` e `seconds` trocam os textos padrão dele.
// `hero` marca a etapa que termina o prato: a câmera chega perto do que ficou em `world.dish`.
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
    phases: {
      prep: { name: "Preparo", hint: "Hora de preparar: fatiar, picar e fazer o molho." },
      cook: { name: "Fogão", hint: "Fogo alto! Agora é no wok." },
    },
    play: {
      market: [{ game: "shop" }],
      prep: [
        { game: "slice", items: ["beef"] },
        { game: "mince", items: ["garlic", "ginger"] },
        {
          game: "pour", step: 0, items: ["soy", "oyster", "sesame", "cornstarch"], starch: true,
          // faixa de cada garrafa no medidor (0 a 1) e quanto ela enche a tigela
          pours: [{ id: "soy", lo: 0.55, hi: 0.72, fill: 0.22 }, { id: "oyster", lo: 0.4, hi: 0.55, fill: 0.16 }, { id: "sesame", lo: 0.16, hi: 0.28, fill: 0.07 }],
        },
        { game: "whisk", step: 0 },
      ],
      cook: [
        { game: "fry", step: 1, items: ["beef"] },
        { game: "toss", step: 2, items: ["broccoli", "garlic", "ginger"] },
        { game: "stir", step: 3 },
        { game: "plate", step: 5, items: ["rice"], dish: "stirfry" },
      ],
    },
  },

  1: {
    title: "Pizza margherita",
    country: "Itália",
    ingredients: [
      { id: "dough", api: "Pizza dough", name: "Massa de pizza" },
      { id: "tomato", api: "Tomato sauce", name: "Molho de tomate" },
      { id: "mozzarella", api: "Fresh mozzarella cheese", name: "Muçarela fresca" },
      { id: "basil", api: "Fresh basil leaves", name: "Manjericão" },
      { id: "oliveOil", api: "Olive oil", name: "Azeite" },
      { id: "seasoning", api: "Salt and pepper to taste", name: "Sal e pimenta" },
    ],
    intruders: [
      { id: "cilantro", name: "Coentro" },
      { id: "cheddar", name: "Cheddar" },
      { id: "ketchup", name: "Ketchup" },
      { id: "mushroom", name: "Shiitake" },
    ],
    products: { topped: "Pizza montada", pizza: "Pizza assada" },
    steps: [
      { text: "Preaquecer o forno", station: "Forno", add: [] },
      { text: "Abrir a massa e espalhar o molho", station: "Bancada", add: ["dough", "tomato"] },
      { text: "Cobrir com muçarela e manjericão", station: "Bancada", add: ["mozzarella", "basil"] },
      { text: "Regar com azeite e temperar", station: "Bancada", add: ["oliveOil", "seasoning"], makes: "topped" },
      { text: "Assar até dourar", station: "Forno", add: ["topped"], makes: "pizza" },
      { text: "Fatiar e servir", station: "Tábua", add: ["pizza"] },
    ],
    phases: {
      prep: { name: "Bancada", hint: "Mão na massa! Abrir, cobrir e temperar." },
      cook: { name: "Forno", hint: "Forno bem quente e olho no ponto!" },
    },
    play: {
      market: [{ game: "shop" }],
      prep: [
        { game: "roll", step: 1, items: ["dough"] },
        { game: "spread", step: 1, on: "pizza", color: "#c8301c", title: "Espalhar o molho", how: "Arraste a colher por toda a massa até cobrir de molho." },
        { game: "arrange", step: 2, on: "pizza", items: ["mozzarella", "basil", "mozzarella", "basil", "mozzarella", "basil"] },
        {
          game: "shake", step: 3, on: "pizza", tool: "seasoning", drizzle: "oliveOil", colors: ["#fffaf0", "#3a2a22"], dots: 260,
          title: "Regar e temperar", how: "Depois do fio de azeite, chacoalhe para temperar por igual.",
        },
      ],
      cook: [
        { game: "wait", step: 4, in: "oven", item: "pizza", preheat: true, label: "Assando", title: "Assar a pizza" },
        { game: "wheel", step: 5, hero: "pizza" },
      ],
    },
  },

  5: {
    title: "Frango com salsa de manga",
    country: "México",
    ingredients: [
      { id: "chicken", api: "Chicken thighs", name: "Sobrecoxa de frango" },
      { id: "mango", api: "Mango, diced", name: "Manga", cut: "Em cubos" },
      { id: "onion", api: "Red onion, finely chopped", name: "Cebola roxa", cut: "Picada fina" },
      { id: "cilantro", api: "Cilantro, chopped", name: "Coentro", cut: "Picado" },
      { id: "lime", api: "Lime juice", name: "Limão" },
      { id: "jalapeno", api: "Jalapeño, minced", name: "Jalapeño", cut: "Picado fino" },
      { id: "seasoning", api: "Salt and pepper to taste", name: "Sal e pimenta" },
      { id: "rice", api: "Cooked rice for serving", name: "Arroz cozido" },
    ],
    intruders: [
      { id: "lemon", name: "Limão-siciliano" },
      { id: "carrot", name: "Cenoura" },
      { id: "basil", name: "Manjericão" },
      { id: "shrimp", name: "Camarão" },
      { id: "tofu", name: "Tofu" },
    ],
    products: { grilled: "Frango grelhado", salsa: "Salsa de manga", mix: "Frango com salsa" },
    steps: [
      { text: "Temperar o frango", station: "Tábua", add: ["chicken", "seasoning"] },
      { text: "Grelhar até dourar", station: "Grelha", add: [], makes: "grilled" },
      { text: "Misturar a salsa de manga", station: "Tigela", add: ["mango", "onion", "cilantro", "lime", "jalapeno"], makes: "salsa" },
      { text: "Cortar o frango e juntar à salsa", station: "Tábua", add: ["grilled", "salsa"], makes: "mix" },
      { text: "Servir sobre o arroz", station: "Servir", add: ["rice", "mix"] },
    ],
    phases: {
      prep: { name: "Tábua", hint: "Na tábua: picar a salsa e temperar o frango." },
      cook: { name: "Grelha", hint: "Brasa acesa! Grelhar, misturar e servir." },
    },
    play: {
      market: [{ game: "shop" }],
      prep: [
        {
          game: "mince", items: ["mango", "onion", "cilantro", "jalapeno"], chops: 7, seconds: 26,
          title: "Picar a salsa", how: "Toque bem rápido para picar manga, cebola, coentro e pimenta.",
        },
        {
          game: "shake", step: 0, on: "chicken", tool: "seasoning", shot: "board", colors: ["#fffaf0", "#3a2a22"], dots: 200,
          title: "Temperar o frango", items: ["chicken", "seasoning"],
        },
      ],
      cook: [
        {
          game: "fry", step: 1, on: "grill", shot: "grill", items: ["chicken"], title: "Grelhar o frango",
          how: "Olhe o medidor de cada pedaço. No verde, toque para virar. No verde de novo, toque para tirar.",
          keys: "Setas escolhem o pedaço, Espaço vira ou tira.",
        },
        { game: "drop", step: 2, into: "bowl", items: ["mango", "onion", "cilantro", "jalapeno", "lime"], title: "Juntar a salsa" },
        { game: "swirl", step: 2, into: "bowl", title: "Misturar a salsa" },
        { game: "slice", step: 3, model: "chicken", title: "Cortar o frango" },
        {
          game: "plate", step: 4, items: ["rice"], portion: "salsa", dish: "chicken", what: "o frango com salsa",
          how: "Toque para virar o arroz no meio do prato. Depois arraste o frango com salsa até cada alvo.",
        },
      ],
    },
  },

  22: {
    title: "Lassi de manga",
    country: "Índia",
    ingredients: [
      { id: "mango", api: "Ripe mango, peeled and diced", name: "Manga madura", cut: "Em cubos" },
      { id: "yogurt", api: "Yogurt", name: "Iogurte" },
      { id: "milk", api: "Milk", name: "Leite" },
      { id: "honey", api: "Honey", name: "Mel" },
      { id: "cardamom", api: "Cardamom powder", name: "Cardamomo em pó" },
      { id: "ice", api: "Ice cubes", name: "Gelo" },
    ],
    intruders: [
      { id: "lemon", name: "Limão-siciliano" },
      { id: "cream", name: "Creme de leite" },
      { id: "sugar", name: "Açúcar" },
      { id: "carrot", name: "Cenoura" },
    ],
    products: { lassi: "Lassi batido" },
    steps: [
      { text: "Pôr manga, iogurte, leite e mel no liquidificador", station: "Liquidificador", add: ["mango", "yogurt", "milk", "honey"] },
      { text: "Bater até ficar cremoso", station: "Liquidificador", add: [] },
      { text: "Juntar o gelo e bater de novo", station: "Liquidificador", add: ["ice"], makes: "lassi" },
      { text: "Servir nos copos com cardamomo", station: "Servir", add: ["lassi", "cardamom"] },
      { text: "Tomar bem gelado", station: "Servir", add: [] },
    ],
    phases: {
      prep: { name: "Liquidificador", hint: "Tudo no liquidificador, e bate até ficar cremoso!" },
      cook: { name: "Servir", hint: "Agora é servir nos copos, sem derramar." },
    },
    play: {
      market: [{ game: "shop" }],
      prep: [
        { game: "drop", step: 0, into: "blender", shot: "blender", items: ["mango", "yogurt", "milk", "honey"], fill: 0.18 },
        { game: "blend", step: 1, color: "#e08600" },
        { game: "drop", step: 2, into: "blender", shot: "blender", items: ["ice", "ice", "ice"], title: "Juntar o gelo" },
        {
          game: "blend", step: 2, mode: "pulse", color: "#e89400", gesture: "rapid", seconds: 14,
          title: "Quebrar o gelo", how: "Toque várias vezes: cada toque é um tranco no gelo.", keys: "Aperte Espaço várias vezes.",
        },
      ],
      cook: [
        {
          game: "pour", step: 3, into: "glasses", shot: "glasses", title: "Servir nos copos",
          pours: [{ from: "blender", name: "Lassi", lo: 0.6, hi: 0.78, fill: 0.78 }, { from: "blender", name: "Lassi", lo: 0.6, hi: 0.78, fill: 0.78 }],
        },
        {
          game: "shake", step: 3, on: "glasses", tool: "cardamom", shot: "glasses", dots: 110, size: 0.028, strokes: 10, hero: "glasses",
          title: "Polvilhar cardamomo", items: ["cardamom"],
        },
      ],
    },
  },

  23: {
    title: "Tiramisù",
    country: "Itália",
    ingredients: [
      { id: "espresso", api: "Espresso, brewed and cooled", name: "Café espresso" },
      { id: "ladyfingers", api: "Ladyfinger cookies", name: "Biscoito champanhe" },
      { id: "mascarpone", api: "Mascarpone cheese", name: "Mascarpone" },
      { id: "cream", api: "Heavy cream", name: "Creme de leite fresco" },
      { id: "sugar", api: "Sugar", name: "Açúcar" },
      { id: "cocoa", api: "Cocoa powder", name: "Cacau em pó" },
    ],
    intruders: [
      { id: "milk", name: "Leite" },
      { id: "honey", name: "Mel" },
      { id: "yogurt", name: "Iogurte" },
      { id: "cheddar", name: "Cheddar" },
    ],
    products: { creme: "Creme de mascarpone", tiramisu: "Tiramisù montado" },
    steps: [
      { text: "Bater o creme de leite", station: "Tigela", add: ["cream"] },
      { text: "Juntar mascarpone e açúcar", station: "Tigela", add: ["mascarpone", "sugar"] },
      { text: "Incorporar com delicadeza", station: "Tigela", add: [], makes: "creme" },
      { text: "Molhar os biscoitos no café e forrar a travessa", station: "Bancada", add: ["ladyfingers", "espresso"] },
      { text: "Espalhar o creme por cima", station: "Bancada", add: ["creme"] },
      { text: "Polvilhar cacau", station: "Bancada", add: ["cocoa"], makes: "tiramisu" },
      { text: "Gelar por algumas horas", station: "Geladeira", add: ["tiramisu"] },
      { text: "Servir gelado", station: "Servir", add: [] },
    ],
    phases: {
      prep: { name: "Tigela", hint: "Primeiro o creme: bater, juntar e incorporar." },
      cook: { name: "Montagem", hint: "Agora as camadas, e depois geladeira!" },
    },
    play: {
      market: [{ game: "shop" }],
      prep: [
        { game: "whisk", step: 0, items: ["cream"], liquid: { color: "#fff6e0", fill: 0.3, to: "#fffdf6" }, title: "Bater o creme" },
        { game: "drop", step: 1, into: "bowl", items: ["mascarpone", "sugar"], fill: 0.12 },
        { game: "swirl", step: 2, into: "bowl", color: "#fff3cf", title: "Incorporar o creme" },
      ],
      cook: [
        { game: "dip", step: 3, items: ["ladyfingers", "espresso"] },
        { game: "spread", step: 4, on: "tiramisu", color: "#fff3cf", thick: 0.2, from: "bowl", title: "Espalhar o creme" },
        {
          game: "shake", step: 5, on: "tiramisu", tool: "sieve", colors: ["#5a2a12", "#6b3418", "#4a200c"], dots: 900, size: 0.06,
          title: "Polvilhar o cacau", items: ["cocoa"],
        },
        {
          game: "wait", step: 6, in: "fridge", item: "tiramisu", label: "Gelando", serve: true, dish: "tiramisu", hero: "tiramisu", shot: "fridge", seconds: 20,
          title: "Gelar", how: "Espere gelar e toque para tirar quando o ponteiro estiver no verde.", keys: "Espaço tira da geladeira.",
        },
      ],
    },
  },

  30: {
    title: "Caipirinha",
    country: "Brasil",
    ingredients: [
      { id: "cachaca", api: "Cachaça (Brazilian sugarcane spirit)", name: "Cachaça" },
      { id: "lime", api: "Lime, cut into wedges", name: "Limão", cut: "Em gomos" },
      { id: "sugar", api: "Granulated sugar", name: "Açúcar" },
      { id: "ice", api: "Ice cubes", name: "Gelo" },
    ],
    intruders: [
      { id: "lemon", name: "Limão-siciliano" },
      { id: "honey", name: "Mel" },
      { id: "milk", name: "Leite" },
      { id: "jalapeno", name: "Jalapeño" },
    ],
    products: { caipirinha: "Caipirinha" },
    steps: [
      { text: "Socar o limão com o açúcar", station: "Bar", add: ["lime", "sugar"] },
      { text: "Encher o copo de gelo", station: "Bar", add: ["ice"] },
      { text: "Despejar a cachaça e mexer", station: "Bar", add: ["cachaca"], makes: "caipirinha" },
      { text: "Enfeitar com limão", station: "Bar", add: [] },
      { text: "Servir na hora", station: "Bar", add: ["caipirinha"] },
    ],
    phases: {
      prep: { name: "Socar", hint: "No bar: limão, açúcar e socador!" },
      cook: { name: "Servir", hint: "Gelo, cachaça e uma boa mexida." },
    },
    play: {
      market: [{ game: "shop" }],
      prep: [
        { game: "drop", step: 0, into: "tumbler", shot: "bar", items: ["lime", "lime", "sugar"], title: "Limão e açúcar no copo" },
        { game: "pound", step: 0, into: "tumbler", title: "Socar o limão" },
      ],
      cook: [
        { game: "drop", step: 1, into: "tumbler", shot: "bar", items: ["ice", "ice", "ice"], title: "Encher de gelo" },
        {
          game: "pour", step: 2, into: "tumbler", shot: "bar", items: ["cachaca"], title: "Despejar a cachaça", seconds: 15,
          pours: [{ id: "cachaca", lo: 0.5, hi: 0.68, fill: 0.4 }],
        },
        { game: "swirl", step: 2, into: "tumbler", shot: "bar", tool: "barSpoon", hero: "tumbler", title: "Mexer o drinque" },
      ],
    },
  },
};

// A ordem em que os pedidos aparecem na tela inicial.
export const MENU = [8, 1, 5, 22, 23, 30];
