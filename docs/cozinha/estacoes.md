# Estações da cozinha e preparos

A cozinha do jogo tem 10 estações. Cada passo de `instructions[]` foi ligado a uma delas em [preparo.md](preparo.md). Os ingredientes que precisam de corte passam antes pela Tábua (veja "Preparos" abaixo).

## Estações

| Estação | O que se faz nela | Verbos da API que levam até ela | Passos | Receitas |
|---|---|---|---:|---:|
| Fogão | refogar, fritar, ferver, cozinhar | sauté, stir-fry, simmer, boil, heat, cook | 83 | 23 |
| Bancada | abrir massa, montar camadas, rechear, enrolar, modelar | roll out, layer, fill, roll, form, arrange, thread | 47 | 22 |
| Tigela | misturar, temperar, marinar, bater à mão | mix, combine, whisk, marinate, season, cream, toss | 36 | 20 |
| Servir | finalizar, decorar, servir | serve, garnish, top, drizzle (no final) | 36 | 35 |
| Forno | preaquecer, assar, tostar, gratinar | preheat, bake, roast, toast, broil | 19 | 10 |
| Liquidificador | bater | blend | 10 | 4 (15, 22, 25, 50) |
| Geladeira | gelar, congelar | chill, freeze, churn | 7 | 6 (6, 23, 33, 34, 39, 49) |
| Bar | macerar, montar drinques | muddle, pour, fill the glass | 7 | 2 (30, 40) |
| Grelha | grelhar | grill | 5 | 4 (5, 24, 26, 47) |
| Tábua | cortar, fatiar | slice, dice | 3 | 3 (1, 5, 48) |

São 253 passos jogáveis e 15 passos "—" que ficam de fora. Contagem conferida por script contra a API.

A Tábua aparece pouco nos passos porque a API já entrega os ingredientes cortados (`Garlic, minced`). Ela é usada de verdade no pré-preparo, logo abaixo.

## Preparos (o que acontece na Tábua)

A parte depois da vírgula no texto do ingrediente diz como ele precisa chegar à receita. No jogo, o jogador arrasta o ingrediente cru até a Tábua e escolhe o corte certo.

| Preparo | Na API | Exemplo |
|---|---|---|
| Picado fino | minced, finely chopped | `Garlic, minced` |
| Picado | chopped | `Tomatoes, chopped` |
| Em cubos | diced, cubed | `Potatoes, diced`, `Tofu, cubed` |
| Fatiado | sliced, thinly sliced | `Bell peppers, sliced` |
| Em tiras finas (juliana) | julienned | `Carrots, julienned` |
| Ralado | grated, shredded | `Ginger, grated`, `Cabbage, shredded` |
| Cortado ao meio | halved | `Cherry tomatoes, halved` |
| Em pedaços | cut into pieces, cut into chunks, chunks | `Chicken, cut into pieces` |
| Em gomos | wedges, cut into wedges | `Lime, cut into wedges` |
| Esfarelado | crumbled | `Feta cheese, crumbled` |
| Descascado | peeled | `Banana, peeled and sliced` |

Os preparos que exigem fogo ou já vêm prontos não passam pela Tábua. O ingrediente entra pronto na despensa:

- cozido: `cooked`, `boiled`, `blanched`, `sautéed`
- grelhado ou frito: `grilled`, `Fried egg`
- outros: `drained and rinsed` (lata), `seasoned`, `brewed and cooled` (café), `soaked in water` (espeto)

## Como isso vira jogo

Cada partida tem três fases, usando só dados da API mais essas tabelas:

1. **Mercado:** escolher os ingredientes certos entre intrusos. Os intrusos vêm da mesma categoria de [ingredientes.md](ingredientes.md), para ficar difícil.
2. **Pré-preparo:** levar à Tábua os ingredientes que pedem corte e escolher o corte.
3. **Cozinhar:** arrastar cada passo para a estação certa, na ordem certa.
