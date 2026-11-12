# Modelos 3D x receitas

Cruzamento entre os pratos 3D do projeto `cook-soundtrack` (`models/extracted`) e as 50 receitas da DummyJSON. O objetivo é saber que receita já tem um modelo pronto, que modelo ainda não tem receita e que ingredientes ligam os dois lados. Os pratos completos montados a partir daqui estão em [menus.md](menus.md).

## De onde vêm os modelos

- Pratos do jogo *Cooking Mama: Cuisine!*, baixados do Models Resource. O script de download está em `cook-soundtrack/models/baixar-tudo.js`.
- 172 pastas, mas só **152 pratos diferentes**: 20 pratos têm uma segunda pasta `(Version 2)`, uma variação do mesmo prato (outra decoração ou ângulo). Aqui contamos pratos, não pastas.
- Cada pasta tem `model.obj`, `model.mtl`, o `.fbx` original e as texturas `.png`. O código do `.fbx` (`Re_001` a `Re_104` e `ReA_105` a `ReA_154`) identifica o prato e aparece nas tabelas abaixo.
- Os modelos são só de **pratos prontos**. Não existem modelos de ingredientes soltos. As texturas `tex_food_*` (manjericão, tomate, limão…) são a guarnição que enfeita o prato, não o ingrediente da receita.
- Dois pares de pratos trazem o mesmo código no arquivo: Calamari e Onion Rings (`ReA_152`), Potato Gratin e Garlic Mashed Potatoes (`ReA_141`). É um defeito da fonte, e a pasta continua sendo o identificador seguro.

## Como classificamos o match

| Nível | Significa | Uso no jogo |
|---|---|---|
| **A** | É o mesmo prato da receita. | Modelo da recompensa na tela de resultado. |
| **B** | Parente próximo: mesmo ingrediente principal, mesma família ou mesma técnica. | Modelo provisório da receita, ou prato extra da mesma parada. |
| **C** | Acompanhamento que combina com o prato. | Entra no menu completo, não substitui o prato. |

A classificação é nossa, feita lendo os ingredientes e o nome de cada lado. Vale revisar antes de usar.

## Receita por receita

Das 50 receitas, 12 têm match A, 37 têm só match B ou C e **1 não tem nenhum** (26, Elote).

| id | Receita | Modelos que combinam |
|---:|---|---|
| 1 | Classic Margherita Pizza | **A** Margherita Pizza (`Re_051`) · B Vegetable Pizza (`Re_052`) |
| 2 | Vegetarian Stir-Fry | B Meat and Vegetable Stir-Fry (`ReA_150`) · B Tofu Steak (`Re_025`) · B Chilled Tofu (`Re_016`) |
| 3 | Chocolate Chip Cookies | B Apple Cookie (`ReA_107`) · B Scone (`Re_050`) |
| 4 | Chicken Alfredo Pasta | B Spaghetti Carbonara (`Re_038`) · B Farfalle (`Re_039`) · B Mac and Cheese (`ReA_123`) |
| 5 | Mango Salsa Chicken | B Sauteed Chicken (`Re_019`) · B Baked Chicken with Herbs (`Re_020`) |
| 6 | Quinoa Salad with Avocado | B Avocado Salad (`Re_034`) |
| 7 | Tomato Basil Bruschetta | **A** Bruschetta (`ReA_113`) · B Garlic Bread (`ReA_110`) |
| 8 | Beef and Broccoli Stir-Fry | B Meat and Vegetable Stir-Fry (`ReA_150`) · B Beef Steak (`Re_002`) |
| 9 | Caprese Salad | **A** Caprese Salad (`Re_096`) · B Tomato Salad (`Re_061`) · B Baked Tomatoes With Cheese (`ReA_139`) |
| 10 | Shrimp Scampi Pasta | B Garlic Shrimp (`Re_049`) · B Spaghetti Aglio e Olio (`ReA_112`) |
| 11 | Chicken Biryani | B Chicken Tikka Masala (`Re_027`) · B Fried Rice (`Re_032`) |
| 12 | Chicken Karahi | B Chicken Tikka Masala (`Re_027`) · C Naan (`Re_086`) |
| 13 | Aloo Keema | B Samosa (`Re_060`) · C Naan (`Re_086`) |
| 14 | Chapli Kebabs | B Salisbury Steak (`Re_001`) |
| 15 | Saag with Makki di Roti | C Naan (`Re_086`), só como pão |
| 16 | Japanese Ramen Soup | B Miso Soup (`Re_024`) · B Somen Noodles (`Re_075`) · C Boiled Egg (`Re_064`) |
| 17 | Moroccan Chickpea Tagine | B Hummus (`Re_017`) · B Falafel (`Re_009`) · B Vegetable Curry (`Re_037`) |
| 18 | Korean Bibimbap | B Fried Rice (`Re_032`) · B Poke Bowl (`Re_028`) · C Sunny-Side-Up Eggs (`Re_077`) |
| 19 | Greek Moussaka | B Lasagna (`ReA_122`) · B Potato Gratin (`ReA_141`) |
| 20 | Butter Chicken | **A** Chicken Tikka Masala (`Re_027`) · C Naan (`Re_086`) |
| 21 | Thai Green Curry | B Thai Massaman Curry (`Re_056`) · B Vegetable Curry (`Re_037`) · C Rice (`Re_035`) |
| 22 | Mango Lassi | B Smoothie (`ReA_111`) |
| 23 | Italian Tiramisu | B Panna Cotta (`ReA_144`) · B Chocolate Mousse (`ReA_132`) |
| 24 | Turkish Kebabs | B Churrasco (`Re_055`) · C Hummus (`Re_017`) |
| 25 | Blueberry Banana Smoothie | **A** Smoothie (`ReA_111`) |
| 26 | Mexican Street Corn (Elote) | Sem match. Só há milho como guarnição. |
| 27 | Russian Borscht | B Cabbage Soup (`Re_013`) · B Minestrone (`Re_042`) · B Carrot Soup (`ReA_136`) |
| 28 | South Indian Masala Dosa | B Samosa (`Re_060`), pelo recheio de batata |
| 29 | Lebanese Falafel Wrap | **A** Falafel (`Re_009`) · B Hummus (`Re_017`) |
| 30 | Brazilian Caipirinha | B Lemonade (`Re_076`) |
| 31 | Spanish Patatas Bravas | B French Fries (`Re_063`) · B German Fried Potatoes (`ReA_128`) · B Hash Browns (`Re_102`) |
| 32 | Vietnamese Fresh Spring Rolls | B Banh Mi (`ReA_109`) · B Gyouza (`Re_015`) |
| 33 | Mediterranean Quinoa Salad | B Tomato Salad (`Re_061`) · B Onion Salad (`Re_062`) |
| 34 | Matcha Green Tea Ice Cream | B Shaved Ice (`Re_074`) |
| 35 | Brazilian Brigadeiros | **A** Chocolate Truffle (`Re_093`) · B Heart Ganache (`Re_091`) |
| 36 | Mexican Chicken Enchiladas | B Healthy Chili Con Carne (`Re_008`) · B Chili (`Re_004`) · C Rice (`Re_035`) |
| 37 | Thai Coconut Shrimp Curry | B Thai Massaman Curry (`Re_056`) · B Shrimp Chili (`Re_048`) · C Rice (`Re_035`) |
| 38 | Greek Spanakopita | B Galette (`Re_085`) · B Samosa (`Re_060`), pela massa recheada |
| 39 | Moroccan Couscous Salad | B Hummus (`Re_017`) · B Tomato Salad (`Re_061`) |
| 40 | Classic Mojito | B Lemonade (`Re_076`) |
| 41 | Caprese Bruschetta | **A** Bruschetta (`ReA_113`) · B Caprese Salad (`Re_096`) |
| 42 | Teriyaki Chicken Stir-Fry | B Meat and Vegetable Stir-Fry (`ReA_150`) · B Sauteed Chicken (`Re_019`) |
| 43 | Mango Avocado Salsa | **A** Guacamole (`Re_036`) · B Avocado Salad (`Re_034`) · B Tomato Salad (`Re_061`) |
| 44 | Shrimp and Asparagus Stir-Fry | B Meat and Vegetable Stir-Fry (`ReA_150`) · B Garlic Shrimp (`Re_049`) |
| 45 | Italian Margherita Pizza | **A** Margherita Pizza (`Re_051`) · B Vegetable Pizza (`Re_052`) |
| 46 | Pesto Pasta with Cherry Tomatoes | B Farfalle (`Re_039`) · B Pasta with Tomato Sauce (`Re_007`) |
| 47 | Hawaiian Chicken Skewers | B Sauteed Chicken (`Re_019`) · B Churrasco (`Re_055`), pelo espeto |
| 48 | Cucumber Avocado Rolls | **A** Sushi (`Re_029`) · B Poke Bowl (`Re_028`) |
| 49 | Mediterranean Chickpea Salad | B Hummus (`Re_017`) · B Tomato Salad (`Re_061`) · B Onion Salad (`Re_062`) |
| 50 | Pineapple Coconut Smoothie | **A** Smoothie (`ReA_111`) |

Observações:

- Quando duas receitas apontam para o mesmo modelo (1 e 45 para a Margherita, 7 e 41 para a Bruschetta, 25 e 50 para a Smoothie), o modelo serve às duas. Isso confirma os pares parecidos já anotados em [../receitas.md](../receitas.md).
- O modelo `Smoothie` é de morango com hortelã. Para as receitas 25 e 50 serve como tipo de prato, mas não tem a cor de mirtilo ou abacaxi.
- O Chicken Tikka Masala é indiano. Entra como A na Butter Chicken (20) porque os dois são frango em molho cremoso de tomate e especiarias. Para o Biryani (11) e o Karahi (12) é só B.
- Poke Bowl é um prato havaiano e cai bem na parada do Havaí (receita 47), mesmo sem ser frango.

## Ingredientes que ligam os dois lados

Como os modelos são pratos, a ligação com [ingredientes.md](ingredientes.md) é feita pelo ingrediente principal do nome do prato. A tabela mostra os ingredientes base que **existem nas duas pontas**.

| Ingrediente (base) | Modelos em que é o protagonista |
|---|---|
| Abacate | Avocado Salad, Guacamole |
| Tomate | Tomato Salad, Baked Tomatoes With Cheese, Gazpacho, Tomato Egg Stir-Fry, Caprese Salad, BLT Sandwich |
| Manjericão e muçarela | Caprese Salad, Margherita Pizza, Vegetable Pizza, Lasagna |
| Queijo | Mac and Cheese, Cheese Fondue, Cheese Omelet, Pao de Queijo, Potato Gratin |
| Batata | French Fries, Hash Browns, Baked Potato, Mashed Potatoes, Garlic Mashed Potatoes, German Fried Potatoes, Potato Salad, Potato Chips, Poutine, Potato Gratin |
| Cebola | Onion Salad, Roasted Onions, Onion Rings |
| Arroz | Rice, Fried Rice, Gapao Rice, Indonesian Fried Rice, Khao Man Kai, Rice Omelette, Rice Gratin, Poke Bowl, Sushi, Paella, Jambalaya |
| Grão-de-bico | Hummus, Falafel |
| Camarão | Garlic Shrimp, Fried Shrimp, Shrimp Chili, Shrimp Tempura, Hot and Sour Thai Soup, Paella |
| Frango | Sauteed Chicken, Baked Chicken with Herbs, Chicken Nugget, Chicken Tikka Masala, Khao Man Kai |
| Carne moída | Salisbury Steak, Tagliatelle Bolognese, Chili, Healthy Chili Con Carne |
| Tofu | Tofu Steak, Tofu Nugget, Chilled Tofu |
| Ovo | Boiled Egg, Sunny-Side-Up Eggs, Deviled Eggs, Egg Salad, Egg Sandwich, Cheese Omelet, Egg Tart |
| Cenoura | Carrot Soup, Carrot Cake, Carrot Smoothie |
| Repolho | Cabbage Soup, Cabbage Roll |
| Massas | Farfalle, Spaghetti Carbonara, Spaghetti Aglio e Olio, Tagliatelle Bolognese, Pasta with Tomato Sauce, Lasagna, Gnocchi |
| Pão (baguete) | Bruschetta, Garlic Bread, Spanish Garlic Soup |
| Chocolate e cacau | Chocolate Truffle, Chocolate Mousse, Hot Chocolate, Heart Ganache |
| Limão | Lemonade |
| Leite de coco, curry | Thai Massaman Curry, Vegetable Curry |
| Ervas e especiarias | Hummus, Falafel (tahine e cominho) |

### Ingredientes que os modelos têm e a API não

São frutas, grãos e proteínas que aparecem nos nomes dos pratos e **não existem** nos 154 ingredientes das receitas. Se a gente criar receitas para esses modelos, estes são os ingredientes novos (cada um precisa de uma ilustração):

- **Abóbora:** Pumpkin Soup, Pumpkin Cake, Pumpkin Pie, Pumpkin Gratin
- **Morango:** Strawberry Tart, Strawberry Mousse, Strawberry Crepe, Strawberry Sandwiches, Swiss Roll
- **Castanha:** Chestnut Cake, Chestnut Pudding, Chestnut Rice, Chestnut Yokan
- **Feijão vermelho (azuki):** Red Bean Soup, Red Bean Rice, Bean Paste Dango
- **Maçã:** Apple Pie, Apple Cookie
- **Porco:** Pork Sauté, Twice Cooked Pork, Tonkatsu
- **Frutos do mar:** Salmon Meuniere, Lobster Thermidor, Calamari, Bouillabaisse
- **Outros:** edamame (Zunda Mochi), mochi e massas japonesas, marshmallow, gengibre-pão (Gingerbread Man)

## Modelos sem receita

Dos 152 pratos, **62 são match de alguma receita** e **90 não têm receita nenhuma** na API. Entre esses 90, alguns já entram em [menus.md](menus.md) como prato de apoio (Feijoada, Paella, Gazpacho…). A lista abaixo traz os **71 que não aparecem nem nas receitas nem nos menus**. São candidatos a receita nova (pelo formulário `/criar` ou como receita local do jogo). Agrupados:

| Grupo | Pratos | Observação |
|---|---|---|
| Doces japoneses | Bean Paste Dango, Castella, Kashiwa Mochi, Mitarashi Dango, Sakura Mochi, Yokan, Zunda Mochi, Chestnut Yokan, Sata Andagi | Reforçam a parada do Japão, que só tem uma sobremesa (matcha). |
| Pratos japoneses | Nikujaga, Ozoni, Okonomiyaki, Katsu Sandwich, Shrimp Tempura, Rice Crackers, Red Bean Rice | Nikujaga é de carne com batata, ingredientes que já existem. |
| Abóbora e castanha | Pumpkin Soup, Pumpkin Cake, Pumpkin Pie, Pumpkin Gratin, Chestnut Cake, Chestnut Pudding, Chestnut Rice | Exigem ingredientes novos (ver acima). |
| Morango e confeitaria | Strawberry Tart, Strawberry Mousse, Strawberry Crepe, Strawberry Sandwiches, Rainbow Mille Crêpe, Rainbow Cupcake, Macaron, Swiss Roll, Marshmallows, Gingerbread Man, Stollen, Carrot Cake | Sobremesas: a API só tem 4. |
| Ovos | Cheese Omelet, Egg Sandwich, Egg Salad, Deviled Eggs, Egg Tart, Rice Omelette, Tomato Egg Stir-Fry | Ovo já existe como ingrediente. São as mais baratas de transformar em receita. |
| Batata e cebola | Potato Salad, Potato Chips, Poutine, Garlic Mashed Potatoes, Roasted Onions, Onion Rings | Usam batata e cebola, já cobertas. |
| Carnes e frutos do mar | Black Bean Burger, Chicken Nugget, Tagliatelle Bolognese, Tofu Nugget, Fried Shrimp, Pork Sauté, Salmon Meuniere, Lobster Thermidor, Bouillabaisse, Calamari | |
| Massas e arroz | Gnocchi, Jambalaya, Khao Man Kai, Indonesian Fried Rice, Rice Gratin | |
| Outros | BLT Sandwich, Cheese Fondue, Fruit Salad, Hot Chocolate, Carrot Smoothie, Soy Milk Donuts, Soy Milk Pancakes, Red Bean Soup | |

## Lacunas

Paradas do mapa sem nenhum modelo que combine: **Coreia do Sul, Turquia, Grécia (só Moussaka via Lasagna) e Marrocos**. Cuba só tem a Lemonade, para o mojito.

Modelos de uma região que **não tem parada** no mapa:

- **França:** Bouillabaisse, Lobster Thermidor, Salmon Meuniere, Galette, Macaron, Rainbow Mille Crêpe
- **Alemanha:** Stollen, German Fried Potatoes
- **Canadá:** Poutine
- **Reino Unido:** Scone
- **Indonésia:** Indonesian Fried Rice

Uma parada "França" no mapa seria a que mais aproveita modelos sem uso. Fica como decisão para a dupla.

## Os modelos como inspiração visual

Regra do projeto: **antes de criar ou melhorar um modelo do jogo, abrir os modelos parecidos daqui e estudar.** Eles são o alvo de qualidade: modelo mais detalhado, textura e decoração mais ricas, e comida com cara de "tasty", que dá vontade de comer. A gente estuda, não copia: nenhum arquivo, textura ou malha deles entra no jogo.

### O que os modelos ensinam

- **A textura faz quase todo o trabalho.** A geometria é simples (o florete de brócolis é quase uma bola), e o que convence é a textura pintada como foto, com normal map por cima. Nos nossos modelos, a geometria tenta fazer tudo e a textura é ruído de uma cor.
- **Degradê e oclusão pintados.** O brócolis vai do verde-escuro no topo ao verde-amarelado embaixo, os vãos ficam mais escuros e o tomate fica mais laranja perto do cabinho. Cor chapada é o que mais denuncia "modelo de código".
- **Mostrar o miolo.** O tomate aparece inteiro e também cortado, com gel e sementes. O corte é o que faz o ingrediente ser lido na hora.
- **Nada é perfeito.** A borda da pizza é alta e torta, a muçarela derrete em poças de tamanhos diferentes e as manchas de tostado ficam só onde a massa sobe.
- **Brilho de molhado.** Casca de tomate, molho e carne refogada têm reflexo forte. O fosco fica para massa, pão e farinha.
- **Prato pronto tem volume e mistura.** O refogado é um monte com muita variedade de forma e cor (tiras enroladas, folhas, anéis), e não peças soltas espalhadas no prato.
- **Enfeite conta.** O copo vai cheio até a borda, com topo cremoso em espiral, fruta, hortelã, canudo listrado e um paninho embaixo. É o enfeite que transforma "um copo" em "um smoothie".

### Teste feito (12/11/2026)

Uma demo comparou 6 itens lado a lado: referência, o nosso de hoje e uma proposta ainda feita só em código. Os itens foram brócolis, tomate, manjericão, pizza margherita, carne com brócolis e lassi de manga. A demo ficou fora do repositório.

| Item | Referência usada | Resultado da proposta |
|---|---|---|
| Brócolis | `Beef Steak` (guarnição) | Melhorou: floretes com galho, degradê e relevo de botões. Pesa bem mais em vértices. |
| Tomate | `Beef Steak`, `Caprese Salad` | Melhorou bastante: o jogo só tinha o vidro de molho, e agora tem o tomate inteiro e a metade cortada. |
| Manjericão | `Margherita Pizza` | Melhorou: a folha tem contorno, nervura e relevo, e é reaproveitada na pizza e na hortelã. |
| Pizza margherita | `Margherita Pizza` | Melhorou bastante: borda irregular, tostado de leopardo, poças de muçarela e azeite. |
| Carne com brócolis | `Meat and Vegetable Stir-Fry` | **Ficou ruim.** Muitas peças pequenas viraram ruído visual, e a carne não se lê como carne. |
| Lassi de manga | `Smoothie` | Melhorou: degradê, topo em espiral, enfeite e canudo listrado. |

A lição do refogado: a referência funciona porque o topo é **uma textura só**, pintada como foto de cima, colada num monte simples. Empilhar dezenas de pecinhas geradas por código não chega lá. Prato com muita mistura pede o caminho da referência: forma simples e textura rica, pintada à mão ou assada (baked) a partir de um modelo detalhado.

### Progresso do aprimoramento visual

A ideia é melhorar os modelos do jogo aos poucos, um grupo de cada vez, sempre comparando com a referência antes de começar. Cada leva entra no jogo só quando o modelo novo fica claramente melhor e as regras dos minijogos continuam funcionando.

**Leva 1 (12/11/2026): tomate, manjericão, pizza e lassi.** Já estão no jogo:

- **Tomate.** Na feira, o vidro de molho ganhou do lado um tomate inteiro (casca brilhante com gomos e cálice em estrela) e uma metade cortada com gel e sementes. Fica em `tomato()`, em `src/three/foods.js`.
- **Manjericão.** O maço tem talos, folhas com contorno, nervura e relevo, e um laço vermelho. A folha solta que vai na pizza é a mesma. A folha de hortelã do lassi sai do mesmo molde, só com outra cor.
- **Pizza.** A massa tem a borda estufada de forma irregular. No forno, o tostado de leopardo vai aparecendo por cima da massa crua, e queima se passar do ponto. A muçarela virou poças com contorno irregular e pintas douradas. Tudo o que os minijogos usam ficou igual: abrir a massa, espalhar o molho, montar e assar.
- **Lassi.** Na hora de servir, o copo ganha canudo listrado, gotinhas de gelado no vidro, escorrido de purê, e por cima espuma em espiral com pintas de açafrão e pistache, cubinhos de manga e hortelã. A cor da espuma acompanha a cor da bebida. O canudo e as gotinhas também aparecem na caipirinha.

Ficaram de fora desta leva o brócolis (a proposta pesa muito em vértices) e o refogado (ficou ruim). O azeite por cima da pizza também ficou de fora, porque a pizza do jogo é montada pelo jogador.

**Próximas levas.** O mesmo vai ser feito com os outros modelos, progressivamente: primeiro os ingredientes da feira que aparecem mais, depois os pratos prontos da tela de resultado. Para cada um: abrir os modelos de referência parecidos, anotar o que eles fazem melhor, fazer a proposta fora do jogo, comparar lado a lado e só então trazer.

**Leva 2 (12/11/2026): brócolis, limão, manga, refogado, frango com salsa de manga e tiramisù.** A primeira feita no Blender, pelo caminho misto: o que fica parado na cena vem do Blender como `.glb` com a textura assada, e o que muda durante o minijogo continua em código. O passo a passo e as lições estão em [pipeline-blender.md](pipeline-blender.md).

Aprovados pelo usuário em 12/11/2026 e **já no jogo** (ver "Troca no jogo" abaixo).

| Modelo | Detalhado (triângulos) | No jogo (triângulos) | `.glb` |
|---|---|---|---|
| Brócolis (inteiro e florete) | 42 mil | 3.000 | 199 KB |
| Limão (inteiro e metade) | 7 mil | 3.000 | 144 KB |
| Manga (inteira e "porco-espinho") | 30 mil | 4.200 | 239 KB |
| Refogado de carne com brócolis | 139 mil | 9.000 | 843 KB |
| Frango com salsa de manga | 22 mil | 9.750 | 689 KB |
| Tiramisù | 22 mil | 6.500 | 411 KB |

Na comparação, o brócolis atual do jogo já era bom de silhueta; o ganho do novo está nos botões e na cor. O refogado é onde o Blender mais rendeu, porque o código sozinho não chegou lá. O frango é o mais fraco e pede outra volta numa leva futura. Todo trabalho no Blender segue a skill [blender](../skills/blender/SKILL.md).

**Leva 3 (12/11/2026): o cenário.** Bancada, parede de azulejo, prateleiras, janelas, coifa, luminárias e miudezas da cozinha; na feira, a banca, os caixotes e as barracas vizinhas ao fundo. Bacias, utensílios e estações ficaram de fora de propósito. A referência do cenário está em [../inspiracao/cooking-mama-cuisine.md](../inspiracao/cooking-mama-cuisine.md) ("O cenário de perto"). O usuário pediu a leva inteira de uma vez, já direto no jogo.

| Modelo | Detalhado (triângulos) | No jogo (triângulos) | `.glb` |
|---|---|---|---|
| Bancada (módulo, repetido 12 vezes) | 4.000 | 2.000 | 164 KB |
| Parede (placa que repete) | 29.500 | 2 | 51 KB |
| Prateleiras (despensa, pratos, temperos, bar) | 45 mil | 18.100 | 1.037 KB |
| Janela (caixilho, cortinas, bandô, vasos) | 17.500 | 5.000 | 503 KB |
| Coifa | 1.400 | 1.400 | 61 KB |
| Luminárias (vermelha, amarela, menta) | 5.000 | 4.500 | 176 KB |
| Miudezas (relógio, manjericão, saleiros, pote de colheres, pano) | 14.600 | 8.300 | 507 KB |
| Banca da feira (balcão, degraus, postes, toldo) | 12.400 | 11.700 | 495 KB |
| Caixote | 1.500 | 1.500 | 86 KB |
| Barracas vizinhas e árvores | 50.700 | 12.000 | 917 KB |

### Troca no jogo

A regra: depois que o usuário aprova uma leva, o modelo procedural sai do caminho do jogo e vai para `src/three/archive/procedural.js` (arquivado, não apagado; a página `art/compare-current.html` usa o arquivo para as próximas comparações), e o jogo passa a carregar o `.glb`. Cada troca também é uma chance de deixar o jogo mais leve, medida antes e depois.

Como ficou a leva 2:

- `src/three/models.js` carrega os `.glb` uma vez, junto com a fonte, antes de montar a cena. Depois disso `model(nome)` é síncrono, e cada cópia divide geometria, material e textura com as outras: só o nó é novo. O `warm()` do mundo também compila os shaders e sobe as texturas dos modelos que ainda não estão na cena (os pratos prontos), para a revelação não travar.
- **Brócolis:** `build.broccoli()` devolve o `.glb` na escala do procedural antigo, então wok, cesta, porções e feira não mudaram.
- **Manga e limão:** a feira mostra o modelo inteiro com a metade (o limão cortado, a banda da manga em cubinhos). Na tábua do picar, a manga entra só inteira, porque os cubinhos são o resultado do corte. O gomo de limão e os cubinhos que caem continuam em código.
- **Pratos prontos:** a etapa ganhou o campo `dish` em `src/data/games.js`. No Empratar (refogado e frango), enquanto a cúpula está fechada, o que o jogador montou some e o prato do Blender toma o lugar. No tiramisù, a travessa sai da geladeira num brilho e volta como o prato pronto, que é o que a foto final enquadra. O paninho do Blender fica de fora: na cozinha o prato já está sobre a toalhinha de renda.
- Saíram do jogo: o brócolis procedural (13 bolinhas calombentas), a manga e o limão em torno, as duas texturas pintadas do brócolis (menos trabalho na abertura) e dois pratos que nunca eram chamados (`build.stirfry` e `build.seared`).

| Medida | Antes | Depois |
|---|---|---|
| Brócolis, triângulos por cópia | ~44.900 (2 malhas) | 3.000 (1 malha) |
| Feira da receita 8, triângulos por quadro | 915.970 | 676.562 (−26%) |
| Feira da receita 8, chamadas de desenho por quadro | 722 | 719 |

A feira foi medida com a mesma arrumação (o sorteio fixado), contando as chamadas de desenho do WebGL num quadro, com a sombra e o pós-processamento. O brócolis pesa ainda mais no wok, que tem cinco cópias, e nas porções do prato. A manga (4.200) e o limão (3.000) ficaram mais pesados que os procedurais (~600 e ~500), de propósito: são eles que levam a cara de comida gostosa, e mesmo assim cabem no orçamento.

Lições da troca:

1. **Medir com a mesma cena.** A feira sorteia a posição dos itens, e a câmera corta o que fica fora do quadro, então duas medidas sem fixar o sorteio não se comparam. Fixar `Math.random` antes de começar a partida resolve.
2. **Pane escondido não roda `requestAnimationFrame`.** Para contar um quadro, embrulhar o `requestAnimationFrame` e guardar a contagem de cada quadro; uma captura de tela força o quadro.
3. **O tamanho cru do `.glb` não é o do procedural.** Quem passa por `fit` (feira, picar, despejar) não sente; quem usa escala fixa (o brócolis no wok e nas porções) precisa de um invólucro com a escala antiga. Conferir lado a lado, antigo e novo, numa página de teste antes de abrir o jogo.
4. **O GLTFLoader limpa o nome do nó** (`lime.001` vira `lime001`). Filtrar partes por pedaço do nome (`cloth`, `cheek`), nunca pelo nome inteiro.

Como ficou a leva 3:

- O `src/three/sets.js` antigo, todo em código, foi copiado inteiro para `src/three/archive/sets.js`. No jogo, `sets.js` perdeu o tampo pintado, os armários, as portas, os três planos da parede, as prateleiras e tudo o que estava nelas, a janela, a coifa, a cúpula das luminárias, as miudezas do tampo, o balcão da feira, os degraus, os postes, o toldo e os caixotes de cinco tábuas.
- **Bancada:** um módulo de armário repetido 12 vezes, esticado para a bancada caber de ponta a ponta. As cópias dividem geometria e material. O material leva o `polygonOffset` que o tampo antigo tinha.
- **Parede:** a placa de 6 azulejos é esticada na largura da parede, e a textura repete na mesma conta (`repeat.x = 68 / 4,08`). O papel de parede menta e o rodapé rosa continuam em código.
- **Janela e luminárias:** o jogo posiciona cada cópia. O céu atrás do vidro, a lâmpada que brilha e as luzes continuam em código.
- **Prateleiras, coifa e miudezas** já vêm no lugar certo, nas medidas do jogo. A barra de utensílios pendurados ficou como estava (utensílio está fora desta leva).
- **Feira:** a banca e as barracas do fundo entram inteiras; o céu do fundo perdeu as barracas pintadas. Cada caixote da partida é uma cópia do modelo, esticada para a largura da fileira; o papel colorido e o calço continuam em código. As barracas do fundo não fazem sombra.

| Plano de câmera | Chamadas de desenho (antes, depois) | Triângulos (antes, depois) |
|---|---|---|
| Cozinha inteira (`wide`) | 1.456, 772 (−47%) | 552.602, 398.518 (−28%) |
| Prato (`plate`) | 738, 454 (−38%) | 303.210, 249.402 (−18%) |
| Liquidificador (`blender`) | 456, 192 (−58%) | 110.722, 117.590 (+6%) |
| Feira (`market`, sem caixotes) | 174, 146 (−16%) | 40.068, 120.132 (3x) |

A feira ficou mais pesada em triângulos porque antes era quase só caixas lisas e um céu pintado; mesmo assim é o plano mais leve do jogo depois do liquidificador.

Medido em `art/scene.html?shot=<plano>` a 1280x720, um quadro com sombra e pós-processamento, contando as chamadas de desenho do WebGL.

Lições da troca:

5. **Não juntar o que a câmera de perto corta.** Com os 12 módulos da bancada numa malha só, o plano do liquidificador desenhava a bancada inteira e foi de 111 mil para 269 mil triângulos. Separados, dividindo geometria e material, cada plano desenha só os módulos que vê.
6. **Uma textura que repete precisa de `RepeatWrapping` em todos os mapas.** Cor, relevo e rugosidade do `.glb` têm cada um o seu `repeat`; mudar só o da cor deixa o brilho de um azulejo esticado na parede inteira.
7. **Cada malha na tela é desenhada umas 4 vezes** (sombra e passadas do pós-processamento). Por isso o módulo da bancada, que aparece de perto em quase todo plano, caiu de 4.000 para 2.000 triângulos. Para achar o culpado, esconder um nó de cada vez e contar o quadro de novo.

## Para a próxima etapa

- Modelo vira recompensa da tela de resultado, no lugar (ou ao lado) da foto da API. Os formatos disponíveis são `.fbx` e `.obj` com texturas. Para a web, o caminho simples é converter para `.glb`.
- Qualquer uso dos modelos no projeto exige ver os termos do Models Resource. Os modelos pertencem aos criadores do jogo original, então não dá para tratar como material livre.
