# Volta ao mundo

O mapa do jogo é uma viagem por 20 paradas, uma para cada culinária da API. A viagem começa no Brasil, atravessa as Américas, a Ásia e a Europa e termina no Marrocos, de onde volta para casa.

## Rota

| # | Parada | `cuisine` na API | Receitas (id) | Easy | Medium |
|---:|---|---|---|---:|---:|
| 1 | Brasil 🇧🇷 | Brazilian, Smoothie* | 30, 35, 25, 50 | 4 | 0 |
| 2 | México 🇲🇽 | Mexican | 5, 26, 43, 36 | 3 | 1 |
| 3 | Cuba 🇨🇺 | Cocktail* | 40 | 1 | 0 |
| 4 | Estados Unidos 🇺🇸 | American | 3 | 1 | 0 |
| 5 | Havaí 🌺 | Hawaiian | 47 | 1 | 0 |
| 6 | Japão 🇯🇵 | Japanese | 42, 48, 16, 34 | 2 | 2 |
| 7 | Coreia do Sul 🇰🇷 | Korean | 18 | 0 | 1 |
| 8 | China 🇨🇳 | Asian* | 44, 2, 8 | 1 | 2 |
| 9 | Vietnã 🇻🇳 | Vietnamese | 32 | 1 | 0 |
| 10 | Tailândia 🇹🇭 | Thai | 21, 37 | 0 | 2 |
| 11 | Índia 🇮🇳 | Indian | 22, 28 | 1 | 1 |
| 12 | Paquistão 🇵🇰 | Pakistani | 12, 11, 13, 14, 15, 20 | 1 | 5 |
| 13 | Líbano 🇱🇧 | Lebanese | 29 | 1 | 0 |
| 14 | Turquia 🇹🇷 | Turkish | 24 | 1 | 0 |
| 15 | Rússia 🇷🇺 | Russian | 27 | 0 | 1 |
| 16 | Grécia 🇬🇷 | Greek | 19, 38 | 0 | 2 |
| 17 | Mediterrâneo 🌊 | Mediterranean | 6, 33, 49 | 3 | 0 |
| 18 | Itália 🇮🇹 | Italian | 1, 7, 9, 41, 45, 46, 4, 10, 23 | 6 | 3 |
| 19 | Espanha 🇪🇸 | Spanish | 31 | 1 | 0 |
| 20 | Marrocos 🇲🇦 | Moroccan | 17, 39 | 2 | 0 |

Total: 50 receitas, 30 Easy e 20 Medium. Em cada parada, as receitas Easy aparecem primeiro.

\* Decisões nossas, porque a API não usa um país nesses casos:

- **Smoothie → Brasil.** As duas vitaminas (25 e 50) entram no Brasil, onde vitamina é comum. Elas são fáceis e servem de tutorial.
- **Cocktail → Cuba.** O mojito é cubano.
- **Asian → China.** Os três pratos são salteados no wok, técnica chinesa.
- **Mediterranean** continua como região, entre a Grécia e a Itália.

## Regras de progresso

- O Brasil começa liberado.
- Terminar qualquer receita de uma parada libera a próxima.
- Cada receita dá de 0 a 3 estrelas, conforme os erros nas três fases.
- Medium vale mais pontos que Easy.
- Não há trava por dificuldade dentro da parada. Coreia, Tailândia, Rússia e Grécia só têm receitas Medium.
- O progresso fica salvo no `localStorage` do navegador. A API não guarda nada.

## Imagens

| O quê | Quantidade | De onde vem |
|---|---:|---|
| Foto de cada receita | 50 | Da API: campo `image`, no formato `https://cdn.dummyjson.com/recipe-images/{id}.webp`. Carregada direto do CDN, sem baixar. |
| Ingredientes | 154 | A criar. Ilustração por ingrediente base de [ingredientes.md](ingredientes.md). |
| Estações | 10 | A criar. Uma ilustração por estação de [estacoes.md](estacoes.md). |
| Mapa e paradas | 1 mapa + 20 paradas | A criar. As bandeiras podem ser emoji. |
| Utensílio | 1 | A criar: espeto de madeira. |
