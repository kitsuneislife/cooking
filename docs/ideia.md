# Cozinhe Comigo – ideia do projeto

Jogo de cozinha no navegador feito com as receitas da DummyJSON. O jogador escolhe uma receita, separa os ingredientes certos e monta o passo a passo na ordem. Depois avalia a receita e pode inventar a sua própria para jogar.

## O que a API oferece (testado em 10/11/2026)

- 50 receitas, todas em inglês.
- Campos úteis para o jogo: `name`, `image`, `ingredients[]`, `instructions[]`, `difficulty` (Easy/Medium), `cuisine`, `tags[]`, `mealType[]`, `prepTimeMinutes`, `cookTimeMinutes`, `rating`.
- Endpoints que vamos usar:

| Método | Endpoint | Para quê |
|---|---|---|
| GET | `/recipes?limit=0` | cardápio completo (cards) |
| GET | `/recipes/search?q=` | busca por nome |
| GET | `/recipes/tags` | lista de tags para o filtro |
| GET | `/recipes/tag/{tag}` e `/recipes/meal-type/{tipo}` | filtros |
| GET | `/recipes/{id}` | detalhe e dados da partida |
| POST | `/recipes/add` | criar receita pelo formulário |
| PATCH | `/recipes/{id}` | enviar a nota que o jogador deu |
| DELETE | `/recipes/{id}` | opcional: tirar receita do cardápio |

## Como o jogo funciona

1. **Escolher o prato.** O jogador viaja pelo mapa da [volta ao mundo](cozinha/volta-ao-mundo.md) ou navega pelo cardápio, com busca e filtros por tag, tipo de refeição ou dificuldade.
2. **Fase 1 – Mercado.** Aparecem os ingredientes da receita misturados com "intrusos" da mesma categoria. O jogador arrasta para a cesta só os que pertencem ao prato.
3. **Fase 2 – Pré-preparo.** Os ingredientes que pedem corte vão para a Tábua, e o jogador escolhe o corte certo (picado, fatiado, ralado…).
4. **Fase 3 – Cozinhar.** Os passos aparecem embaralhados. O jogador arrasta cada passo para a estação certa (Fogão, Forno, Tigela…) e na ordem certa; há botão de desfazer.
5. **Resultado.** De 0 a 3 estrelas, conforme os erros, com bônus para Medium. Mostra a foto e a receita completa como recompensa e libera a próxima parada do mapa.
6. **Avaliar.** O jogador dá de 1 a 5 estrelas e a nota vai por PATCH. A tela mostra a resposta da API.

## Dados preparados

Como as 50 receitas são fixas, preparamos à mão uma camada de dados do jogo, ligada à API pelo `id` da receita e pelo texto exato de cada ingrediente:

- [api/recipes.json](api/recipes.json) e [api/tags.json](api/tags.json): cópia da API salva em 10/11/2026, só para consulta.
- [cozinha/ingredientes.md](cozinha/ingredientes.md): os 239 textos de ingrediente agrupados em 154 ingredientes base, por categoria.
- [cozinha/estacoes.md](cozinha/estacoes.md): as 10 estações da cozinha e os tipos de corte.
- [cozinha/preparo.md](cozinha/preparo.md): os 268 passos das receitas, resumidos em português e ligados a uma estação.
- [cozinha/volta-ao-mundo.md](cozinha/volta-ao-mundo.md): a rota de 20 paradas, as regras de progresso e as imagens que faltam criar.
- [cozinha/modelos-3d.md](cozinha/modelos-3d.md): cruzamento dos 152 pratos 3D do `cook-soundtrack` com as 50 receitas, ingredientes em comum e modelos sem receita.
- [cozinha/menus.md](cozinha/menus.md): 14 pratos completos (entrada, principal, acompanhamento, sobremesa e bebida) montados com os modelos.

O app continua buscando as receitas na API com `fetch`. A camada local só acrescenta o que a API não tem: tradução, categoria, estação e país. A cópia em `docs/api` não é usada pelo app.

Interação principal: arrastar e soltar (mouse e toque). Toda ação de arrastar tem um equivalente pelo teclado: Tab para focar o item, Espaço para pegar, setas para mover, Espaço para soltar, Esc para cancelar. Um aviso para leitor de tela (`aria-live`) anuncia cada movimento.

## Telas (rotas)

| Rota | Tela |
|---|---|
| `/` | Início: apresentação e botão "Jogar" |
| `/mapa` | Volta ao mundo: paradas liberadas e estrelas |
| `/receitas` | Cardápio: cards com busca e filtros |
| `/receitas/:id` | Detalhe da receita e botão "Cozinhar" |
| `/jogar/:id` | Partida (três fases, resultado, avaliação) |
| `/criar` | Formulário "Invente uma receita" |

## Formulário "Invente uma receita" (POST)

- Campos: nome, culinária, dificuldade, ingredientes (um por linha) e passos, cada passo com a sua estação escolhida numa lista.
- Validação: nome obrigatório; pelo menos 3 ingredientes e 3 passos; todo passo com estação.
- Ingredientes digitados que não estão em [ingredientes.md](cozinha/ingredientes.md) entram sem categoria, e os intrusos dessa receita são sorteados de qualquer categoria.
- Envia para `/recipes/add`. A API devolve a receita com `id` 51, mas não salva de verdade.
- Por isso, a receita criada fica guardada no estado do app e já aparece no cardápio para jogar.

## Como cada requisito é atendido

| Requisito | Onde |
|---|---|
| 1. React Router, 2+ rotas | 6 rotas acima |
| 2. GET com fetch, useEffect/useState | cardápio, detalhe, partida |
| 3. Componentes com props | `RecipeCard`, `IngredientPicker`, `StepOrder`, `StarRating`, `StatusMessage` |
| 4. Detalhe/busca/filtro | busca, filtros por tag e tipo, página de detalhe |
| 5. Formulário controlado + POST | `/criar` |
| 6. PUT/PATCH ou DELETE | PATCH da avaliação (DELETE opcional) |
| 7. Organização | `src/pages`, `src/components`, `src/services/recipes.js` |
| 8. Carregando, sucesso, erro | componente `StatusMessage` em toda requisição |
| 9. Qualidade de interface | layout responsivo, HTML semântico, `label` nos campos, foco visível, teclado |

## Estrutura de pastas

```
src/
  services/recipes.js   funções fetch (getRecipes, searchRecipes, getRecipe, addRecipe, rateRecipe…)
  data/                 camada do jogo: ingredientes, estações, passos e rota (vinda de docs/cozinha)
  pages/                Home, WorldMap, Recipes, RecipeDetail, Play, CreateRecipe
  components/           RecipeCard, Filters, IngredientPicker, StepOrder, StarRating, StatusMessage
  App.jsx               rotas e estado das receitas criadas
```

## Limitações da API (vão para o README)

- Nada é salvo: POST, PATCH e DELETE só simulam a operação e devolvem o resultado.
- A receita criada ganha `id` 51, que não existe no servidor. `GET` ou `PATCH /recipes/51` retornam 404, então ela só existe no estado do app enquanto a página estiver aberta.
- Textos das receitas em inglês. O jogo mostra os resumos em português da camada local; o texto original aparece no detalhe.
- A API não diz país, estação nem categoria de ingrediente. Isso foi preparado à mão em `docs/cozinha` e só cobre as 50 receitas atuais. Se a API mudar uma receita, a camada local precisa ser revista.
- Só há duas dificuldades (Easy e Medium).

## Como vamos trabalhar

A dupla desenvolve o projeto inteiro junto, com o Claude. Os dois precisam entender e saber explicar todas as decisões para a arguição.

## Extras, se sobrar tempo

- Cronômetro baseado em `prepTimeMinutes + cookTimeMinutes`.
- Botão de remover receita do cardápio (DELETE).
