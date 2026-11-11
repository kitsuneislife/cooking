# Ingredientes

As 50 receitas usam 239 textos de ingrediente diferentes. Muitos são o mesmo ingrediente com outro corte ou preparo (`Garlic, minced` e `Garlic cloves, minced`, por exemplo). Aqui eles estão agrupados num **ingrediente base**, que é o que vira um item do jogo, com uma imagem só.

- **Ingrediente:** nome no jogo, em português.
- **Na API:** os textos exatos que aparecem em `ingredients[]`. É por eles que o jogo liga a resposta da API ao ingrediente base.
- **Receitas:** `id` das receitas que usam o ingrediente.

A parte depois da vírgula no texto da API (`minced`, `sliced`, `diced`…) é o **preparo** que o ingrediente precisa ter. A lista de preparos está em [estacoes.md](estacoes.md).

Fonte: [../api/recipes.json](../api/recipes.json), salvo em 10/11/2026.

## Legumes e verduras

| Ingrediente | Na API | Receitas |
|---|---|---|
| Alho | `Garlic, minced` · `Garlic cloves, minced` | 2, 4, 7, 8, 10, 12, 17, 19, 24, 27, 31, 41, 42, 44, 45, 47 |
| Cebola | `Onions, finely chopped` · `Onions, grated` · `Onions, thinly sliced` | 11, 13, 14, 15, 17, 19, 24, 27, 28, 38 |
| Cebola roxa | `Red onion, finely chopped` · `Red onion, cut into wedges` · `Red onions, thinly sliced` | 5, 29, 33, 39, 43, 47, 49 |
| Cebolinha | `Green onions, sliced` | 16, 44 |
| Gengibre | `Ginger, minced` · `Ginger, grated` · `Ginger, julienned` | 2, 8, 12, 15, 42, 44 |
| Tomate | `Tomatoes, chopped` · `Tomatoes, diced` · `Tomatoes, finely chopped` · `Tomatoes, sliced` · `Tomatoes, thinly sliced` · `Tomatoes, crushed` | 7, 9, 11, 12, 13, 14, 17, 19, 29, 41, 45 |
| Tomate-cereja | `Cherry tomatoes, halved` | 6, 33, 39, 46, 49 |
| Pimentão | `Bell peppers, sliced` · `Red bell pepper, diced` | 2, 6, 21, 37, 42, 47 |
| Pimenta verde | `Green chilies, chopped` · `Green chilies, sliced` | 11, 12, 14, 15, 28 |
| Jalapeño | `Jalapeño, minced` | 5 |
| Cenoura | `Carrots, sliced` · `Carrots, diced` · `Carrots, grated` · `Carrots, julienned` · `Carrots, julienned and sautéed` | 2, 17, 18, 27, 32, 42 |
| Pepino | `Cucumber, diced` · `Cucumber, julienned` · `Cucumbers, sliced` | 6, 29, 32, 33, 39, 48, 49 |
| Batata | `Potatoes, diced` · `Potatoes, peeled and diced` · `Potatoes, boiled and mashed` | 13, 27, 28, 31 |
| Beterraba | `Beets, peeled and shredded` | 27 |
| Repolho | `Cabbage, shredded` | 27 |
| Berinjela | `Eggplant, sliced` · `Eggplants, sliced` | 19, 21 |
| Abobrinha | `Zucchini, sliced` · `Zucchini, sliced and grilled` | 18, 37 |
| Brócolis | `Broccoli florets` | 2, 8, 42 |
| Aspargo | `Asparagus spears, trimmed and cut into pieces` | 44 |
| Milho | `Corn on the cob` · `Corn kernels` | 26, 36 |
| Espinafre | `Spinach, washed and chopped` · `Spinach, chopped and cooked` · `Spinach, blanched and seasoned` | 15, 18, 38 |
| Folha de mostarda | `Mustard greens, washed and chopped` | 15 |
| Acelga chinesa (bok choy) | `Bok choy, chopped` | 16 |
| Alface | `Lettuce leaves` · `Lettuce, shredded` | 29, 32 |
| Broto de feijão | `Bean sprouts, blanched` | 18 |
| Cogumelo shiitake | `Shiitake mushrooms, sliced` | 16 |
| Azeitona | `Olives` · `Kalamata olives, sliced` | 17, 33, 49 |

## Frutas

| Ingrediente | Na API | Receitas |
|---|---|---|
| Limão | `Lime juice` · `Lime wedges` · `Lime, cut into wedges` | 5, 26, 30, 40, 43 |
| Limão-siciliano | `Lemon juice` | 10, 49 |
| Manga | `Mango, diced` · `Ripe mango, peeled and diced` | 5, 22, 43 |
| Abacate | `Avocado, diced` · `Avocado, sliced` | 6, 43, 48 |
| Banana | `Banana, peeled and sliced` | 25, 50 |
| Mirtilo | `Blueberries, fresh or frozen` | 25 |
| Abacaxi | `Pineapple chunks` · `Pineapple chunks, fresh or frozen` · `Pineapple juice` | 47, 50 |
| Romã | `Pomegranate seeds` | 14 |

## Ervas frescas

| Ingrediente | Na API | Receitas |
|---|---|---|
| Manjericão | `Fresh basil leaves` · `Basil leaves` · `Fresh basil, chopped` | 1, 7, 9, 21, 37, 41, 45 |
| Coentro (folhas) | `Cilantro, chopped` · `Fresh cilantro, chopped` · `Coriander leaves, chopped` · `Fresh coriander leaves` | 5, 11, 12, 13, 14, 17, 36, 43 |
| Salsinha | `Fresh parsley, chopped` · `Fresh parsley for garnish` · `Parsley, finely chopped` | 4, 10, 24, 29, 31, 33 |
| Hortelã | `Fresh mint leaves` · `Fresh mint leaves, chopped` · `Mint leaves` | 11, 32, 39, 40 |
| Endro | `Dill, chopped` | 38 |
| Folha de curry | `Curry leaves` | 28 |
| Louro | `Bay leaves` | 27 |

## Temperos e especiarias

| Ingrediente | Na API | Receitas |
|---|---|---|
| Sal | `Salt` · `Salt to taste` | 3, 11, 12, 13, 14, 15, 20 |
| Sal e pimenta-do-reino | `Salt and pepper to taste` · `Salt and black pepper to taste` | 1, 4, 5, 6, 7, 9, 10, 24, 38, 41, 43, 45, 46, 49 |
| Cominho | `Cumin` · `Cumin powder` · `Cumin seeds` | 12, 13, 14, 17, 24, 28 |
| Coentro em pó | `Coriander` · `Coriander powder` | 12, 13, 14, 17, 24 |
| Pimenta vermelha em pó | `Red chili powder` · `Chili powder` | 12, 13, 14, 26 |
| Pimenta caxemira | `Kashmiri red chili powder` | 20 |
| Pimenta calabresa | `Red pepper flakes` | 10, 24, 44 |
| Páprica | `Paprika` | 17 |
| Páprica defumada | `Smoked paprika` | 31 |
| Cúrcuma | `Turmeric powder` | 13, 28 |
| Garam masala | `Garam masala` | 12, 20 |
| Biryani masala | `Biryani masala` | 11 |
| Canela | `Cinnamon` | 17, 19 |
| Noz-moscada | `Nutmeg` | 19 |
| Pimenta-da-jamaica | `Allspice` | 19 |
| Cardamomo | `Cardamom powder` | 22 |
| Semente de mostarda | `Mustard seeds` | 28 |
| Feno-grego seco (kasuri methi) | `Kasuri methi (dried fenugreek leaves)` | 20 |
| Orégano | `Dried oregano` | 49 |
| Gergelim torrado | `Toasted sesame seeds` | 18 |

## Carnes, aves, peixes e ovos

| Ingrediente | Na API | Receitas |
|---|---|---|
| Frango | `Chicken breast, sliced` · `Chicken breast, thinly sliced` · `Chicken breasts, cooked and shredded` · `Chicken breasts, cut into chunks` · `Chicken thighs` · `Chicken thighs, boneless and skinless` · `Chicken, cut into pieces` · `Grilled chicken slices` | 4, 5, 11, 12, 16, 20, 21, 36, 42, 47 |
| Carne moída | `Ground beef` · `Ground lamb or beef` | 13, 14, 19, 24 |
| Contrafilé | `Beef sirloin, thinly sliced` | 8 |
| Bulgogi (carne marinada) | `Beef bulgogi (marinated and grilled beef slices)` | 18 |
| Camarão | `Shrimp, peeled and deveined` · `Shrimp, cooked and sliced` | 10, 32, 37, 44 |
| Ovo | `Egg` · `Eggs` · `Egg yolks` · `Fried egg` · `Soft-boiled eggs` | 3, 14, 16, 18, 19, 34, 38 |
| Tofu | `Tofu, cubed` | 2 |
| Falafel | `Falafel balls` | 29 |

## Laticínios e leites

| Ingrediente | Na API | Receitas |
|---|---|---|
| Manteiga | `Butter` · `Butter, softened` · `Unsalted butter` | 3, 4, 20, 35 |
| Ghee | `Ghee` | 11, 15, 28 |
| Leite | `Milk` · `Whole milk` | 19, 22, 34 |
| Creme de leite fresco | `Heavy cream` | 4, 20, 23, 34 |
| Iogurte | `Yogurt` | 11, 20, 22 |
| Iogurte grego | `Greek yogurt` | 25, 50 |
| Creme azedo | `Sour cream for serving` | 27, 36 |
| Leite condensado | `Sweetened condensed milk` | 35 |
| Muçarela de búfala | `Fresh mozzarella cheese` · `Fresh mozzarella cheese, sliced` · `Fresh mozzarella, sliced` | 1, 9, 41, 45 |
| Parmesão | `Parmesan cheese` · `Parmesan cheese, grated` | 4, 19, 46 |
| Queijo feta | `Feta cheese, crumbled` | 6, 33, 38, 39, 49 |
| Queijo cotija | `Cotija cheese, crumbled` | 26 |
| Mix de queijos mexicanos | `Shredded Mexican cheese blend` | 36 |
| Mascarpone | `Mascarpone cheese` | 23 |
| Leite de coco | `Coconut milk` | 21, 37, 50 |
| Leite de amêndoas | `Almond milk` | 25 |

## Grãos, massas e pães

| Ingrediente | Na API | Receitas |
|---|---|---|
| Arroz | `Cooked rice for serving` · `Cooked white rice` · `Cooked white rice for serving` · `Jasmine rice for serving` · `Basmati rice` · `Sushi rice, seasoned` · `Cooked noodles or rice for serving` | 2, 5, 8, 11, 18, 21, 37, 42, 44, 48 |
| Quinoa | `Quinoa, cooked` | 6, 33 |
| Cuscuz marroquino | `Couscous, cooked` | 39 |
| Grão-de-bico | `Chickpeas, cooked` · `Canned chickpeas, drained and rinsed` | 17, 39, 49 |
| Feijão-preto | `Black beans, drained and rinsed` | 36 |
| Farinha de trigo | `All-purpose flour` · `Flour` | 3, 19 |
| Fubá | `Cornmeal (makki ka atta)` | 15 |
| Amido de milho | `Cornstarch` | 8 |
| Massa de pizza | `Pizza dough` | 1, 45 |
| Massa filo | `Phyllo dough` | 38 |
| Massa de dosa | `Dosa batter (fermented rice and urad dal batter)` | 28 |
| Fettuccine | `Fettuccine pasta` | 4 |
| Linguine | `Linguine pasta` | 10 |
| Penne | `Penne pasta` | 46 |
| Macarrão de ramen | `Ramen noodles` | 16 |
| Macarrão de arroz | `Rice vermicelli, cooked` | 32 |
| Papel de arroz | `Rice paper wrappers` | 32 |
| Baguete | `Baguette, sliced` | 7, 41 |
| Pão sírio | `Flatbread for serving` | 24 |
| Wrap (tortilha de trigo) | `Whole wheat or regular wraps` | 29 |
| Tortilha de milho | `Corn tortillas` | 36 |
| Nachos | `Tortilla chips for serving` | 43 |
| Biscoito champanhe | `Ladyfinger cookies` | 23 |
| Alga nori | `Nori sheets` · `Norwegian seaweed (nori)` | 16, 48 |
| Chia | `Chia seeds (optional)` | 25 |

## Molhos, pastas e condimentos

| Ingrediente | Na API | Receitas |
|---|---|---|
| Shoyu | `Soy sauce` · `Soy sauce for dipping` | 2, 8, 16, 42, 44, 47, 48 |
| Molho teriyaki | `Teriyaki sauce` | 42 |
| Molho de ostra | `Oyster sauce` | 8 |
| Molho de peixe | `Fish sauce` | 21, 37 |
| Mirin | `Mirin` | 16 |
| Gochujang | `Gochujang (Korean red pepper paste)` | 18 |
| Pasta de curry verde | `Green curry paste` | 21 |
| Pasta de curry vermelho | `Red curry paste` | 37 |
| Pasta de alho e gengibre | `Ginger-garlic paste` | 11, 13, 14, 20 |
| Molho de tomate | `Tomato sauce` | 1, 31 |
| Purê de tomate | `Tomato puree` | 20 |
| Extrato de tomate | `Tomato paste` | 27 |
| Molho de enchilada | `Enchilada sauce` | 36 |
| Molho picante | `Hot sauce` | 31 |
| Ketchup | `Ketchup` | 47 |
| Maionese | `Mayonnaise` | 26, 31 |
| Pesto | `Basil pesto sauce` | 46 |
| Tahine | `Tahini sauce` | 24, 29 |
| Molho de amendoim | `Peanut dipping sauce` | 32 |
| Chutney de coco | `Coconut chutney for serving` | 28 |
| Vinagrete de limão | `Lemon vinaigrette dressing` | 6, 33, 39 |
| Redução de balsâmico | `Balsamic glaze` | 7, 9, 41 |
| Gengibre em conserva e wasabi | `Pickled ginger and wasabi for serving` | 48 |

## Óleos

| Ingrediente | Na API | Receitas |
|---|---|---|
| Azeite | `Olive oil` · `Extra virgin olive oil` | 1, 7, 9, 19, 31, 38, 41, 45, 49 |
| Óleo de gergelim | `Sesame oil` | 2, 8, 16, 18, 42, 44 |
| Óleo de cozinha | `Cooking oil` | 12, 13, 14 |

## Açúcares e confeitaria

| Ingrediente | Na API | Receitas |
|---|---|---|
| Açúcar | `Sugar` · `Granulated sugar` · `White sugar` | 3, 20, 21, 23, 30, 34, 37, 40 |
| Açúcar mascavo | `Brown sugar` | 3, 47 |
| Mel | `Honey` | 22, 25, 50 |
| Cacau em pó | `Cocoa powder` | 23, 35 |
| Gotas de chocolate | `Chocolate chips` | 3 |
| Granulado | `Chocolate sprinkles` | 35 |
| Extrato de baunilha | `Vanilla extract` | 3 |
| Bicarbonato de sódio | `Baking soda` | 3 |
| Matcha | `Matcha green tea powder` | 34 |

## Bebidas e líquidos

| Ingrediente | Na API | Receitas |
|---|---|---|
| Caldo | `Chicken broth` · `Vegetable broth` · `Beef or vegetable broth` | 16, 17, 27 |
| Café espresso | `Espresso, brewed and cooled` | 23 |
| Vinho tinto | `Red wine` | 19 |
| Vinho branco | `White wine` | 10 |
| Cachaça | `Cachaça (Brazilian sugarcane spirit)` | 30 |
| Rum branco | `White rum` | 40 |
| Água com gás | `Club soda` | 40 |
| Gelo | `Ice cubes` | 22, 30, 40, 50 |

## Não é ingrediente

| Item | Na API | Receitas | Observação |
|---|---|---|---|
| Espeto de madeira | `Wooden skewers, soaked in water` | 47 | Vira utensílio da estação Bancada. |

## Observações

- 154 ingredientes base, mais o espeto. Conferido por script: os 239 textos da API aparecem aqui, e os `id` batem com a API.
- `Salt and pepper to taste` junta dois ingredientes num texto só. No jogo ele aparece como um item "Sal e pimenta" para não quebrar a ligação com a API.
- Alguns textos já vêm prontos ou cozidos (`Cooked white rice`, `Fried egg`, `Grilled chicken slices`). No jogo eles entram prontos e não passam pela tábua.
- `Lime` (limão taiti) e `Lemon` (limão-siciliano) são frutas diferentes e ficam separados.
