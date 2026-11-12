# Pratos completos

Refeições montadas a partir dos modelos 3D de [modelos-3d.md](modelos-3d.md). Cada menu junta uma entrada, um prato principal, um acompanhamento, uma sobremesa e uma bebida, **quando os modelos permitem**. A coluna "Receita" mostra a receita da API que combina, ou "—" se o modelo ainda não tem receita. Os níveis A, B e C são os mesmos do outro documento.

Os 14 menus usam 53 dos 152 pratos. Em 11 deles a cobertura das receitas da API é de pelo menos metade, e esses são os melhores candidatos a fase do jogo.

## Como ler

- **Cobertura** é quantos itens do menu têm receita na API (com match A, B ou C). Conta as linhas da tabela com receita preenchida.
- Um menu só faz sentido para o jogo se der para **cozinhar o prato principal**. Por isso o principal vem sempre em negrito e com a receita quando existe.

## 1. Pizzaria italiana (Itália) — cobertura 4 de 5

| Papel | Modelo | Receita |
|---|---|---|
| Entrada | Bruschetta (`ReA_113`) | 7 ou 41 (A) |
| Salada | Caprese Salad (`Re_096`) | 9 (A) |
| **Principal** | **Margherita Pizza (`Re_051`)** | 1 ou 45 (A) |
| Sobremesa | Panna Cotta (`ReA_144`) | 23 Tiramisu (B) |
| Bebida | Lemonade (`Re_076`) | — |

É o menu mais forte: três itens com receita de match A e ingredientes que se repetem (tomate, manjericão, muçarela, azeite). Quem fizer a pizza já tem quase tudo do mercado para a bruschetta e a caprese.

## 2. Churrasco brasileiro (Brasil) — cobertura 3 de 6

| Papel | Modelo | Receita |
|---|---|---|
| **Principal** | **Feijoada (`Re_014`)** | — |
| Carne | Churrasco (`Re_055`) | 47 (B, pelo espeto) |
| Acompanhamento | Rice (`Re_035`) | — |
| Entrada | Pao de Queijo (`Re_095`) | — |
| Sobremesa | Chocolate Truffle (`Re_093`) | 35 Brigadeiro (A) |
| Bebida | Lemonade (`Re_076`) | 30 Caipirinha (B) |

A parada 1 do mapa já tem Brigadeiro e Caipirinha. Feijoada, Pão de Queijo e Churrasco são pratos brasileiros que a API não tem, então são os melhores candidatos a receita nova.

## 3. Mexicano (México) — cobertura 3 de 5

| Papel | Modelo | Receita |
|---|---|---|
| Entrada | Guacamole (`Re_036`) | 43 Mango Avocado Salsa (A) |
| **Principal** | **Healthy Chili Con Carne (`Re_008`)** | 36 Enchiladas (B) |
| Principal alternativo | Chili (`Re_004`) | 36 Enchiladas (B) |
| Acompanhamento | Rice (`Re_035`) | — |
| Bebida | Lemonade (`Re_076`) | — |

Feijão-preto, milho, coentro e creme azedo aparecem tanto nas enchiladas quanto no chili. Falta uma sobremesa mexicana.

## 4. Tailandês (Tailândia) — cobertura 2 de 4

| Papel | Modelo | Receita |
|---|---|---|
| Sopa | Hot and Sour Thai Soup (`Re_058`) | — |
| **Principal** | **Thai Massaman Curry (`Re_056`)** | 21 Green Curry e 37 Coconut Shrimp Curry (B) |
| Prato de arroz | Gapao Rice (`ReA_127`) | — |
| Acompanhamento | Rice (`Re_035`) | 21 e 37 pedem arroz jasmim (C) |

As duas receitas tailandesas pedem pasta de curry, leite de coco e molho de peixe, e todas são Medium. O menu dá uma sopa e um arroz para quem terminar a parada.

## 5. Indiano e paquistanês (Índia e Paquistão) — cobertura 5 de 5

| Papel | Modelo | Receita |
|---|---|---|
| Entrada | Samosa (`Re_060`) | 13 Aloo Keema e 28 Masala Dosa (B) |
| **Principal** | **Chicken Tikka Masala (`Re_027`)** | 20 Butter Chicken (A), 12 Karahi (B), 11 Biryani (B) |
| Pão | Naan (`Re_086`) | 12, 13, 15, 20 (C) |
| Acompanhamento | Rice (`Re_035`) | 11 Biryani (C, serve com arroz) |
| Bebida | Smoothie (`ReA_111`) | 22 Mango Lassi (B) |

Duas paradas do mapa (Índia e Paquistão, 8 receitas ao todo) dividem os mesmos quatro modelos. O Paquistão é a parada com mais receitas Medium e se beneficia mais do menu.

## 6. Japonês (Japão) — cobertura 5 de 6

| Papel | Modelo | Receita |
|---|---|---|
| Sopa | Miso Soup (`Re_024`) | 16 Ramen (B) |
| Entrada | Gyouza (`Re_015`) | — |
| **Principal** | **Sushi (`Re_029`)** | 48 Cucumber Avocado Rolls (A) |
| Prato quente | Tonkatsu (`Re_011`) | 42 Teriyaki Stir-Fry (C) |
| Acompanhamento | Rice (`Re_035`) | 42 (C) |
| Sobremesa | Dorayaki (`Re_087`) | 34 Matcha Ice Cream (C) |

O Japão é a parada com mais modelos disponíveis. Os doces (Dorayaki, Yokan, Mochi, Dango) formam uma segunda sobremesa e um possível mini-menu só de wagashi.

## 7. Oriente Médio (Líbano, Turquia, Mediterrâneo, Marrocos) — cobertura 5 de 5

| Papel | Modelo | Receita |
|---|---|---|
| Entrada | Hummus (`Re_017`) | 17, 39, 49 (B) |
| **Principal** | **Falafel (`Re_009`)** | 29 Falafel Wrap (A) |
| Salada | Tomato Salad (`Re_061`) | 33, 39, 49 (B) |
| Salada | Onion Salad (`Re_062`) | 33, 49 (B) |
| Pão | Naan (`Re_086`) | 24 Turkish Kebabs, pão sírio (C) |

Um só menu cobre quatro paradas que não têm modelo próprio. O grão-de-bico, o pepino, o tomate-cereja e a feta ligam as seis receitas de saladas mediterrâneas e marroquinas aos mesmos três modelos.

## 8. Espanhol (Espanha) — cobertura 1 de 5

| Papel | Modelo | Receita |
|---|---|---|
| Sopa fria | Gazpacho (`Re_079`) | — |
| Sopa | Spanish Garlic Soup (`ReA_114`) | — |
| Entrada | Croquettes (`ReA_124`) | 31 Patatas Bravas (B, pela batata frita) |
| **Principal** | **Paella (`Re_033`)** | — |
| Sobremesa | Flan (`ReA_147`) | — |

A Espanha só tem Patatas Bravas na API (os modelos `French Fries`, `German Fried Potatoes` e `Hash Browns` ficam como provisórios para ela). O menu espanhol é o que mais ganha com receitas novas: Gazpacho e Paella usam tomate, alho, pimentão, arroz e camarão, todos já cadastrados.

## 9. Wok chinês (China) — cobertura 2 de 4

| Papel | Modelo | Receita |
|---|---|---|
| **Principal** | **Meat and Vegetable Stir-Fry (`ReA_150`)** | 2, 8, 42, 44 (B) |
| Principal 2 | Twice Cooked Pork (`Re_012`) | — |
| Acompanhamento | Fried Rice (`Re_032`) | 11, 18 (B) |
| Entrada | Gyouza (`Re_015`) | — |

Um modelo cobre as quatro receitas de salteado (2, 8, 42, 44). É a maior reutilização de um modelo só.

## 10. Vietnamita (Vietnã) — cobertura 1 de 3

| Papel | Modelo | Receita |
|---|---|---|
| **Principal** | **Banh Mi (`ReA_109`)** | 32 Spring Rolls (B) |
| Entrada | Gyouza (`Re_015`) | — |
| Sopa | Hot and Sour Thai Soup (`Re_058`) | — |

O Banh Mi é vietnamita, mas não é o rolinho primavera. Como a parada só tem uma receita, serve de prato do país. A Gyouza e a sopa tailandesa entram como vizinhos do Sudeste Asiático.

## 11. Café da manhã (várias paradas) — cobertura 4 de 5

| Papel | Modelo | Receita |
|---|---|---|
| **Principal** | **Sunny-Side-Up Eggs (`Re_077`)** | 18 Bibimbap (C, ovo frito) |
| Batata | Hash Browns (`Re_102`) | 31 (B) |
| Pão | Scone (`Re_050`) | 3 Cookies (B) |
| Doce | French Toast (`Re_040`) | — |
| Bebida | Smoothie (`ReA_111`) | 25, 50 (A) |

As vitaminas 25 e 50 e a dosa (28) são as receitas de café da manhã da API. Este menu serve de base para um filtro "Café da manhã" no cardápio.

## 12. Americano (Estados Unidos) — cobertura 3 de 6

| Papel | Modelo | Receita |
|---|---|---|
| **Principal** | **Mac and Cheese (`ReA_123`)** | 4 Alfredo (B) |
| Batata | Baked Potato (`Re_103`) | — |
| Batata | Hash Browns (`Re_102`) | 31 (B) |
| Sobremesa | Apple Pie (`ReA_105`) | 3 Cookies (B, com Apple Cookie) |
| Doce | Donuts (`Re_054`) | — |
| Bebida | Lemonade (`Re_076`) | — |

## 13. Russo (Rússia) — cobertura 1 de 4

| Papel | Modelo | Receita |
|---|---|---|
| Sopa | Cabbage Soup (`Re_013`) | 27 Borscht (B) |
| **Principal** | **Cabbage Roll (`Re_018`)** | — |
| Ensopado | Beef Stew (`Re_003`) | — |
| Acompanhamento | Mashed Potatoes (`Re_090`) | — |

O Borscht usa repolho, batata, cenoura e beterraba. O Cabbage Roll aproveita o mesmo repolho e vira o segundo prato da parada.

## 14. Grego (Grécia) — cobertura 3 de 4

| Papel | Modelo | Receita |
|---|---|---|
| **Principal** | **Lasagna (`ReA_122`)** | 19 Moussaka (B) |
| Gratinado | Potato Gratin (`ReA_141`) | 19 Moussaka (B) |
| Salada | Tomato Salad (`Re_061`) | — |
| Entrada | Baked Tomatoes With Cheese (`ReA_139`) | 38 Spanakopita (B, pela feta e massa) |

A Moussaka é uma lasanha de berinjela com carne e molho branco. Sem um modelo grego, a Lasagna é o parente mais próximo. A Grécia é a parada com mais lacuna e precisa de um modelo ou de uma ilustração própria.

## Resumo por menu

| Menu | Parada(s) | Cobertura | Prato principal |
|---|---|---|---|
| Indiano e paquistanês | 11, 12 | 5 de 5 | Chicken Tikka Masala |
| Oriente Médio | 13, 14, 17, 20 | 5 de 5 | Falafel |
| Pizzaria italiana | 18 | 4 de 5 | Margherita Pizza |
| Café da manhã | várias | 4 de 5 | Sunny-Side-Up Eggs |
| Japonês | 6 | 5 de 6 | Sushi |
| Grego | 16 | 3 de 4 | Lasagna |
| Mexicano | 2 | 3 de 5 | Healthy Chili Con Carne |
| Churrasco brasileiro | 1 | 3 de 6 | Feijoada |
| Americano | 4 | 3 de 6 | Mac and Cheese |
| Tailandês | 10 | 2 de 4 | Thai Massaman Curry |
| Wok chinês | 8 | 2 de 4 | Meat and Vegetable Stir-Fry |
| Vietnamita | 9 | 1 de 3 | Banh Mi |
| Russo | 15 | 1 de 4 | Cabbage Roll |
| Espanhol | 19 | 1 de 5 | Paella |
