# Inventário dos modelos 3D

Relação de tudo o que aparece em 3D no jogo, dividida em três grupos: o que já vem do Blender, o que ainda é procedural (feito em código) e precisa ser refeito no Blender, e o que ainda nem existe e vai nascer direto no Blender. Serve para escolher a próxima leva. O andamento de cada leva e as medidas ficam em [modelos-3d.md](modelos-3d.md); o passo a passo, em [pipeline-blender.md](pipeline-blender.md).

Levantado em 12/11/2026, depois das levas 1 a 5. As receitas jogáveis hoje são 6: carne com brócolis (8), pizza margherita (1), frango com salsa de manga (5), lassi de manga (22), tiramisù (23) e caipirinha (30), em `MENU` de `src/data/games.js`.

## Resumo

| Grupo | Quantos | Onde está |
|---|---:|---|
| Já no Blender (`.glb` no jogo) | 20 arquivos (mais a manteiga, pronta e fora do jogo) | `public/models/`, carregados por `src/three/models.js` |
| Procedural que vai para o Blender | 22 ingredientes, 10 estações (as embalagens já saíram todas) | `src/three/foods.js`, `kit.js`, `gear.js`, `sets.js` |
| Procedural que fica em código | as peças que mudam durante o minijogo | mesmos arquivos |
| Ainda não existe | 112 ingredientes, 1 utensílio, 44 pratos prontos | só nas receitas da API |

Dos 154 ingredientes base das receitas, 42 já têm modelo no jogo (no Blender ou em código) e 112 ainda não.

## 1. Já no Blender

| `.glb` | O que é | Leva |
|---|---|---|
| `broccoli` | brócolis inteiro e florete | 2 |
| `lime` | limão inteiro e metade | 2 |
| `mango` | manga inteira e banda em cubinhos | 2 |
| `stirfry` | prato pronto: carne com brócolis | 2 |
| `chicken` | prato pronto: frango com salsa de manga | 2 |
| `tiramisu` | prato pronto: tiramisù | 2 |
| `counter`, `wall`, `shelves`, `window`, `hood`, `lamp`, `props` | cozinha: bancada, azulejo, prateleiras, janela, coifa, luminárias, miudezas | 3 |
| `stand`, `crate`, `stalls` | feira: banca, caixote, barracas do fundo | 3 |
| `tableware` | prato, tábua, tigela azul, wok, panelinhas, tigela de arroz, tigela de molho, pote de amido, cúpula | 4 |
| `utensils` | faca, fouet, espátula, colher, rolo, aro da peneira, socador, colher bailarina, cortador de pizza, concha | 5 |
| `bottles` | garrafa alta, garrafa bojuda, vidro de boca larga, potinho de tempero, saleiro e pimenteiro (vidro, líquido e tampa; o rótulo continua em código) | 6 |
| `packs` | pote com tampa de alumínio, caixinha com telhadinho, saco de papel kraft, lata (o rótulo e a cor continuam em código) | 7 |
| `butter` | tablete de manteiga embrulhado; pronto, mas **fora do jogo** até a receita com manteiga entrar | 7 |

O frango com salsa de manga ainda é o mais fraco dos pratos prontos e pede outra volta (anotado em `modelos-3d.md`).

## 2. Procedurais que vão para o Blender

Tudo aqui é modelo parado na cena: aparece na feira, na bancada ou na estação e não muda de forma no minijogo. Pela regra do projeto, vem do Blender. A coluna "Receitas" diz quantas das 50 receitas da API usam o ingrediente, para ajudar na prioridade.

### Ingredientes da feira (a despensa)

A lista sai de `PANTRY`, em `src/three/foods.js`. Cada linha é o modelo que aparece no caixote da feira.

| Ingrediente | Construtor | Receitas | Observação |
|---|---|---:|---|
| Contrafilé | `build.steak` (`kit.js`) | 1 | Bife cru e selado só trocam a textura: um modelo, dois materiais. |
| Frango (bandeja com 2 sobrecoxas) | `chickenTray`, `chicken` (`foods.js`) | 10 | A sobrecoxa crua e a grelhada também só trocam a textura. Um dos mais usados. |
| Camarão | `build.shrimp` | 4 | Hoje só aparece como opção errada na feira. |
| Tofu | `build.tofu` | 1 | Idem. |
| Tomate (inteiro e metade) | `tomato` (`foods.js`) | 11 | Leva 1, ainda em código. Mais usado entre os frescos. |
| Molho de tomate (vidro + tomate) | `tomatoSauce`, `BOTTLES.tomato` | 2 | O vidro já vem do `bottles.glb` (leva 6); o tomate ao lado continua em código. |
| Manjericão (maço) | `basil` | 7 | Leva 1, ainda em código. A folha solta da pizza continua em código. |
| Coentro (maço) | `cilantro` | 8 | Hoje é um monte de bolinhas; pede folha de verdade. |
| Cebola roxa | `redOnion` | 7 | O mesmo modelo, com outra cor, serve à cebola comum (10 receitas). |
| Pimenta jalapeño | `jalapeno` | 1 | O mesmo modelo, verde mais claro, serve à pimenta verde (5 receitas). |
| Limão-siciliano | `lemon` | 2 | Pode sair do mesmo arquivo do limão (`lime.glb`). |
| Alho (cabeça) | `build.garlic` | 16 | O ingrediente mais usado das 50 receitas. |
| Dentes de alho | `build.cloves` | | Aparece na tábua antes de picar. Mesma leva do alho. |
| Gengibre | `build.ginger` | 6 | |
| Cenoura | `build.carrot` | 6 | Hoje só opção errada na feira. |
| Shiitake | `build.mushroom` | 1 | Idem. |
| Bola de massa de pizza | `doughBall` | 2 | Só a da feira. Na bancada, a massa vira o disco da pizza, que fica em código. |
| Muçarela (duas bolas) | `mozzarella` | 4 | As fatias que derretem no forno ficam em código. |
| Queijo cheddar | `cheddar` | 0 | Só opção errada na feira; não existe nas receitas. |
| Gelo (montinho) | `icePile` | 4 | O cubo que cai no copo fica em código. |
| Xícara de espresso | `espresso` | 1 | O café dentro é uma superfície que o minijogo usa (`userData.surface`); fica em código. |
| Pacote de biscoito champanhe | `ladyfingerPack` | 1 | O biscoito solto escurece no café e fica em código. |

### Embalagens

Metade da despensa é embalagem com rótulo. Hoje cada uma é gerada por uma função de código (`bottle`, `tub`, `carton`, `sack`, `tin`, `packTex`). A proposta é modelar **cada formato uma vez** no Blender e manter o rótulo em código (`labelTexture`), porque o texto e a cor mudam por ingrediente. Assim boa parte dos 112 ingredientes que ainda não existem (seção 4) também saem quase de graça.

Não sobrou nenhuma. A garrafa (em vários formatos) e o saleiro saíram na leva 6 e estão em `bottles.glb`. Pote, caixinha, saco e lata saíram na leva 7 e estão em `packs.glb` (seção 1). O amido, que era uma caixa só da feira, passou a usar na feira o mesmo pote da bancada (`build.cornstarch`, do `tableware.glb`); a caixa foi para o arquivo.

### Estações e aparelhos

| Peça | Construtor | O que continua em código |
|---|---|---|
| Fogareiro | `build.stove` (`kit.js`) | As chamas e o `userData.heat`. |
| Forno | `oven` (`gear.js`) | O forro que acende com a temperatura (`setTemp`), a porta articulada e o mostrador. |
| Grelha | `grill` | As 260 brasas que apagam e reacendem e o leito que pulsa (`tick`). No Blender, só o corpo e a grade. |
| Geladeira | `fridge` | A porta e o forro que brilha; os mantimentos de dentro podem vir do Blender. |
| Liquidificador | `blender` | O líquido dentro do copo e as lâminas girando. |
| Copo de bebida e copo baixo | `glass` (`gear.js`) | O líquido, as gotinhas e a cobertura. |
| Travessa de vidro (tiramisù) | `glassDish` | As camadas de dentro. |
| Pedra de massa (bancada da pizza) | `pastrySlab` | Nada. |
| Cesta de compras (feira) | `build.basket` | As compras que entram nela. |
| Barra de utensílios pendurados | `hangingSet` (`sets.js`) | Só o trilho e os ganchos ainda são código; o resto já é `.glb`. |

### Ficam em código de propósito

Não entram em leva nenhuma, porque mudam durante o minijogo ou são efeito:

- Pizza (`pizza`): abre, recebe molho, assa e queima.
- Fatia de muçarela (`mozzaSlice`), biscoito solto (`ladyfinger`), folha de manjericão (`basilLeaf`), gomo de limão (`limeWedge`), cubo de gelo (`iceCube`), tirinha de carne (`beefStrip`), monte de arroz do prato (`riceMound`), cubinhos e colheradas (`cubes`, `dollop`).
- Cobertura do lassi (`lassiTop`) e molho da tigela (`build.sauce`).
- Texturas pintadas do cenário: papel de parede, piso, céu, calçamento, jogo americano e toalhinha de renda (`sets.js`).
- Feira: varal de lâmpadas e bandeirinhas, que balançam e piscam.

### Parece código morto

`build.serve` e `egg` (`kit.js`) não são chamados em lugar nenhum fora do arquivo. Antes de modelar o ovo, conferir se `build.serve` pode ser apagado.

## 3. Pratos prontos das receitas jogáveis

| Receita | Prato pronto | Situação |
|---|---|---|
| Carne com brócolis (8) | `stirfry.glb` | No Blender. |
| Frango com salsa de manga (5) | `chicken.glb` | No Blender, pede outra volta. |
| Tiramisù (23) | `tiramisu.glb` | No Blender. |
| Pizza margherita (1) | a própria pizza montada | Fica em código: é o jogador quem monta. |
| Lassi de manga (22) | copo com `lassiTop` | Fica em código. O copo entra na leva das estações. |
| Caipirinha (30) | copo baixo | Fica em código. O copo entra na leva das estações. |

## 4. Ainda não existem: direto no Blender

Tudo o que as outras 44 receitas da API pedem e o jogo ainda não tem. Esses nascem no Blender, sem passar por procedural. A lista completa com os textos da API está em [ingredientes.md](ingredientes.md); aqui ficam os nomes, com o número de receitas que usam cada um entre parênteses.

### Frescos (modelo próprio)

Pedem um modelo cada, com a cara de "tasty" da referência:

- **Legumes e verduras:** pepino (7), pimentão (6), tomate-cereja (5), batata (4), azeitona (3), espinafre (3), cebolinha (2), berinjela (2), abobrinha (2), milho (2), alface (2), beterraba (1), repolho (1), aspargo (1), folha de mostarda (1), acelga chinesa (1), broto de feijão (1).
- **Frutas:** abacate (3), banana (2), abacaxi (2), mirtilo (1), romã (1).
- **Ervas:** salsinha (6), hortelã (4), endro (1), folha de curry (1), louro (1). A folha de hortelã já existe em código dentro do lassi; o maço é novo.
- **Carnes e ovos:** ovo (7), carne moída (4), bulgogi (1), falafel (1).
- **Queijos:** feta (5), parmesão (3), cotija (1), mix de queijos mexicanos (1).
- **Pães e massas:** baguete (2), alga nori (2), pão sírio (1), wrap (1), tortilha de milho (1), nachos (1), massa filo (1), fettuccine (1), linguine (1), penne (1), macarrão de ramen (1), macarrão de arroz (1), papel de arroz (1).

Reaproveitam um modelo que já existe, só com outra cor ou material:

- Cebola comum (10), do modelo da cebola roxa.
- Pimenta verde (5), do jalapeño.

### Embalagens (formato genérico + rótulo em código)

Saem dos formatos da seção 2 e do `packs.glb` (pote, caixinha, saco, lata), sem modelo novo:

- **Temperos em pote:** cominho (6), coentro em pó (5), pimenta vermelha em pó (4), pimenta calabresa (3), cúrcuma (2), garam masala (2), canela (2), pimenta caxemira (1), páprica (1), páprica defumada (1), biryani masala (1), noz-moscada (1), pimenta-da-jamaica (1), semente de mostarda (1), feno-grego seco (1), orégano (1), gergelim torrado (1). Pede um formato novo: o potinho de tempero.
- **Garrafas:** óleo de cozinha (3), redução de balsâmico (3), molho de peixe (2), mirin (1), molho picante (1), vinho tinto (1), vinho branco (1), rum branco (1), água com gás (1), extrato de baunilha (1).
- **Potes e vidros:** pasta de alho e gengibre (4), ghee (3), vinagrete de limão (3), tahine (2), maionese (2), gochujang (1), pasta de curry verde (1), pasta de curry vermelho (1), purê de tomate (1), extrato de tomate (1), molho de enchilada (1), pesto (1), molho de amendoim (1), chutney de coco (1), gengibre em conserva e wasabi (1), creme azedo (2), iogurte grego (2).
- **Caixinhas:** leite de coco (3), caldo (3), leite de amêndoas (1).
- **Latas:** grão-de-bico (3), feijão-preto (1), leite condensado (1), matcha (1).
- **Sacos:** farinha de trigo (2), quinoa (2), açúcar mascavo (2), cuscuz marroquino (1), fubá (1), gotas de chocolate (1), granulado (1), chia (1), bicarbonato de sódio (1), massa de dosa (1).
- **Manteiga** (4): tablete embrulhado, já modelado (`butter.glb`, leva 7). Entra no jogo com a primeira receita jogável que usar manteiga: falta pôr `butter` em `MODELS` e o item em `PANTRY`, com o rótulo pintado por `packTex`.

### Utensílio

- Espeto de madeira (receita 47, Hawaiian Chicken Skewers).

### Pratos prontos

As 44 receitas que ainda não são jogáveis não têm prato pronto. O modelo de referência de cada uma (o que estudar antes de modelar) está na tabela "Receita por receita" de [modelos-3d.md](modelos-3d.md). Cada prato entra junto com a sua receita, quando ela virar jogável.

## Ordem sugerida

A divisão completa em levas de até 8 modelos está em [lotes-modelos.md](lotes-modelos.md).

1. **Embalagens genéricas** (garrafa, pote, caixinha, saco, lata, caixa, saleiro, potinho de tempero). Uma leva só tira de código metade da despensa atual e já deixa prontos uns 50 ingredientes futuros.
2. **Frescos que já estão no jogo e são os mais usados:** alho, tomate, frango, cebola, coentro, manjericão, gengibre. Juntos, aparecem em quase todas as receitas.
3. **Estações:** fogareiro, forno, grelha, geladeira, liquidificador, copos. Aparecem em todo plano de câmera, então pesam no desempenho e no visual de toda partida.
4. **Restante da despensa atual:** contrafilé, camarão, tofu, cenoura, shiitake, jalapeño, limão-siciliano, massa, muçarela, gelo, espresso, biscoito, cesta.
5. **Frescos novos**, na ordem em que as próximas receitas virarem jogáveis, começando pelos mais usados: ovo, pepino, pimentão, salsinha, tomate-cereja.
