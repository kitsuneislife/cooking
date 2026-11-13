# Lotes de modelagem

Todos os modelos que faltam, divididos em levas pequenas de itens parecidos. Cada leva tem **no máximo 8 modelos**, para dar tempo de caprichar em cada um. Itens parecidos dividem material, técnica e referência, então a leva sai mais rápida e mais coerente.

A lista de origem, com construtores e o que fica em código, é o [inventário](inventario-modelos.md). O passo a passo de cada leva segue [pipeline-blender.md](pipeline-blender.md), e o andamento vai para [modelos-3d.md](modelos-3d.md). As levas 1 a 5 já estão no jogo, por isso a numeração começa na 6.

- **Procedural:** já existe em código e vai ser refeito no Blender, depois arquivado.
- **Novo:** ainda não existe no jogo e nasce direto no Blender.
- A ordem das levas é a ordem sugerida: primeiro o que aparece em toda partida, depois o que só as receitas novas pedem.
- Para fazer uma leva: `/lote <número>` no Claude Code (acrescente `direto` para pular a espera da aprovação). O roteiro completo está em `.claude/commands/lote.md`.
- Item novo de receita que ainda não é jogável é modelado e versionado, mas só entra no jogo quando a receita entrar.

## Visão geral

| Leva | Tema | Modelos | Procedurais | Novos |
|---:|---|---:|---:|---:|
| 6 | Vidros e garrafas | 5 | 4 | 1 |
| 7 | Embalagens de papel e plástico | 6 | 5 | 1 |
| 8 | Bulbos, raízes e cogumelo | 8 | 6 | 2 |
| 9 | Tomates, pimentas e legumes de casca lisa | 7 | 2 | 5 |
| 10 | Ervas em maço | 8 | 2 | 6 |
| 11 | Carnes, ovos e proteínas | 8 | 4 | 4 |
| 12 | Aparelhos e equipamento | 8 | 7 | 1 |
| 13 | Vidro, bar e café | 6 | 6 | 0 |
| 14 | Queijos | 6 | 2 | 4 |
| 15 | Massas cruas e secas | 8 | 1 | 7 |
| 16 | Pães e folhas secas | 7 | 1 | 6 |
| 17 | Frutas | 7 | 1 | 6 |
| 18 | Folhas e verduras | 8 | 0 | 8 |
| 19 a 26 | Pratos prontos | 44 | 1 (frango, nova versão) | 43 |

## Ingredientes e embalagens

### Leva 6: vidros e garrafas

**Feita em 12/11/2026, já no jogo** (`bottles.glb`). Nada ficou fora: o potinho de tempero entrou como o frasco do cardamomo. Detalhes e números em [modelos-3d.md](modelos-3d.md).

Vidro colorido, líquido por dentro e rótulo. O rótulo continua em código (`labelTexture`), porque o texto e a cor mudam por ingrediente; o modelo é só o formato.

| Modelo | Tipo | Serve a |
|---|---|---|
| Garrafa alta de gargalo fino | Procedural | shoyu, óleo de gergelim, teriyaki, azeite, cachaça, ketchup; depois óleo de cozinha, balsâmico, molho de peixe, mirin, molho picante, vinhos, rum, água com gás, baunilha |
| Garrafa bojuda | Procedural | molho de ostra |
| Vidro de boca larga | Procedural | mel, molho de tomate; depois pasta de alho e gengibre, ghee, tahine, maionese, gochujang, pastas de curry, purê e extrato de tomate, molho de enchilada, pesto, molho de amendoim, chutney, conservas, vinagrete |
| Saleiro e pimenteiro | Procedural | sal e pimenta |
| Potinho de tempero | Novo | cardamomo (hoje é garrafa) e os 17 temperos em pó das receitas novas |

Referência: as garrafas das prateleiras de `shelves.glb` (leva 3), para os dois ficarem da mesma família.

### Leva 7: embalagens de papel e plástico

**Feita em 12/11/2026.** Pote, caixinha, saco e lata estão no jogo (`packs.glb`), e a feira mostra o amido no pote da bancada. A manteiga (`butter.glb`) está pronta e fora do jogo, esperando a primeira receita jogável com manteiga. Números e lições em [modelos-3d.md](modelos-3d.md).

Superfícies foscas, dobras e tampas. Mesmo esquema da leva 6: formato no Blender, rótulo em código.

| Modelo | Tipo | Serve a |
|---|---|---|
| Pote com tampa de alumínio | Procedural | iogurte, mascarpone; depois iogurte grego, creme azedo |
| Caixinha com telhadinho | Procedural | leite, creme de leite; depois leite de coco, caldo, leite de amêndoas |
| Saco de papel dobrado | Procedural | açúcar; depois farinha, quinoa, açúcar mascavo, cuscuz, fubá, gotas de chocolate, granulado, chia, bicarbonato, massa de dosa |
| Lata | Procedural | cacau; depois grão-de-bico, feijão-preto, leite condensado, matcha |
| Pote de amido na feira | Procedural | amido de milho (trocar a caixa da feira pelo pote que a bancada já usa, do `tableware.glb`) |
| Tablete de manteiga embrulhado | Novo | manteiga |

### Leva 8: bulbos, raízes e cogumelo

Casca fosca de terra, pele fina, corte que mostra camadas ou fibra. É a leva de maior retorno: o alho está em 16 receitas e a cebola, somando roxa e comum, em 17.

| Modelo | Tipo | Observação |
|---|---|---|
| Cabeça de alho | Procedural | |
| Dentes de alho | Procedural | aparecem na tábua antes de picar |
| Gengibre | Procedural | |
| Cebola roxa | Procedural | com metade cortada mostrando os anéis; a cebola comum sai do mesmo modelo com outra cor |
| Cenoura | Procedural | |
| Shiitake | Procedural | |
| Batata | Novo | |
| Beterraba | Novo | com metade cortada, o miolo roxo é o que lê |

### Leva 9: tomates, pimentas e legumes de casca lisa

Casca brilhante e esticada, cálice ou cabinho verde, corte com sementes. Todos pedem o mesmo material de casca molhada.

| Modelo | Tipo | Observação |
|---|---|---|
| Tomate (inteiro e metade) | Procedural | leva 1, ainda em código; o vidro de molho ao lado sai da leva 6 |
| Jalapeño | Procedural | a pimenta verde sai do mesmo modelo, verde mais claro |
| Tomate-cereja | Novo | penca no cabinho e uma metade |
| Pimentão | Novo | vermelho e verde, mesmo modelo |
| Pepino | Novo | inteiro e rodelas |
| Berinjela | Novo | |
| Abobrinha | Novo | |

### Leva 10: ervas em maço

Folha fina com nervura, talo e laço. O desafio é o mesmo em todas: ler a erva de longe sem subir muito polígono. A folha solta da pizza continua em código.

| Modelo | Tipo |
|---|---|
| Manjericão | Procedural (leva 1, ainda em código) |
| Coentro | Procedural |
| Salsinha | Novo |
| Hortelã | Novo |
| Endro | Novo |
| Folha de curry | Novo |
| Louro | Novo |
| Cebolinha | Novo |

### Leva 11: carnes, ovos e proteínas

Carne crua e cozida com brilho de molhado, gordura e textura de fibra. Onde há estado cru e cozido, o modelo é um só e o jogo troca o material.

| Modelo | Tipo | Observação |
|---|---|---|
| Contrafilé | Procedural | cru e selado só trocam a textura |
| Bandeja de frango | Procedural | sobrecoxa crua e grelhada só trocam a textura |
| Camarão | Procedural | |
| Tofu | Procedural | |
| Carne moída (bandeja) | Novo | |
| Bulgogi | Novo | carne marinada em fatias |
| Ovo | Novo | inteiro e frito; conferir antes se `egg` e `build.serve` são código morto |
| Falafel | Novo | bolinhas, com uma aberta mostrando o verde |

### Leva 12: aparelhos e equipamento

Esmalte, metal e madeira das estações. Aparecem em quase todo plano de câmera, então medir desempenho antes e depois é obrigatório. O que se mexe (chamas, brasas, portas, forro que acende) continua em código.

| Modelo | Tipo |
|---|---|
| Fogareiro | Procedural |
| Forno | Procedural |
| Grelha (corpo e grade) | Procedural |
| Geladeira (com os mantimentos de dentro) | Procedural |
| Pedra de massa | Procedural |
| Trilho e ganchos dos utensílios pendurados | Procedural |
| Cesta de compras da feira | Procedural |
| Espeto de madeira | Novo |

### Leva 13: vidro, bar e café

Vidro transparente e louça branca. Juntos porque o vidro é o material mais difícil de acertar e todos dividem o mesmo. O líquido, as gotinhas e a cobertura continuam em código.

| Modelo | Tipo |
|---|---|
| Copo alto (lassi) | Procedural |
| Copo baixo (caipirinha) | Procedural |
| Liquidificador (base e copo) | Procedural |
| Travessa de vidro (tiramisù) | Procedural |
| Xícara de espresso com pires | Procedural |
| Montinho de gelo | Procedural |

### Leva 14: queijos

Massa clara, casca, furinhos ou esfarelado. As fatias de muçarela que derretem no forno continuam em código.

| Modelo | Tipo |
|---|---|
| Muçarela de búfala | Procedural |
| Cheddar | Procedural |
| Feta (bloco e esfarelado) | Novo |
| Parmesão (pedaço e ralado) | Novo |
| Cotija | Novo |
| Mix de queijos mexicanos (pacote ralado) | Novo |

### Leva 15: massas cruas e secas

Farinha, massa crua e macarrão seco. Fosco, com pó por cima.

| Modelo | Tipo |
|---|---|
| Bola de massa de pizza | Procedural |
| Fettuccine (ninho) | Novo |
| Linguine (maço) | Novo |
| Penne | Novo |
| Macarrão de ramen (bloco) | Novo |
| Macarrão de arroz | Novo |
| Papel de arroz | Novo |
| Massa filo | Novo |

### Leva 16: pães e folhas secas

Casca assada, miolo e folhas finas e planas.

| Modelo | Tipo |
|---|---|
| Pacote de biscoito champanhe | Procedural |
| Baguete (inteira e fatias) | Novo |
| Pão sírio | Novo |
| Wrap de trigo | Novo |
| Tortilha de milho | Novo |
| Nachos (tigela ou pacote) | Novo |
| Alga nori | Novo |

### Leva 17: frutas

Casca com textura própria e corte que mostra a polpa, como já foi feito na manga e no limão.

| Modelo | Tipo | Observação |
|---|---|---|
| Limão-siciliano | Procedural | pode entrar no `lime.glb` |
| Abacate | Novo | inteiro e metade com caroço |
| Banana | Novo | penca |
| Abacaxi | Novo | inteiro e pedaços |
| Mirtilo | Novo | cumbuquinha |
| Romã | Novo | metade aberta com as sementes |
| Azeitona | Novo | potinho ou montinho |

### Leva 18: folhas e verduras

Folhas grandes e onduladas, talos e grãos. A mais trabalhosa em silhueta, por isso fica depois que as ervas (leva 10) firmarem a técnica de folha.

| Modelo | Tipo |
|---|---|
| Espinafre | Novo |
| Folha de mostarda | Novo |
| Acelga chinesa (bok choy) | Novo |
| Alface | Novo |
| Repolho | Novo |
| Aspargo (maço) | Novo |
| Broto de feijão | Novo |
| Milho na espiga | Novo |

## Pratos prontos

Cada prato entra junto com a sua receita, quando ela virar jogável; a ordem destas levas pode mudar conforme a ordem das receitas. Entre parênteses está o `id` da receita na API. O modelo de referência de cada uma, para estudar antes de modelar, está em "Receita por receita" de [modelos-3d.md](modelos-3d.md).

A pizza da receita 45 (Italian Margherita Pizza) é a mesma da receita 1 e fica em código, montada pelo jogador. Por isso são 44 receitas, mas 43 pratos novos, mais a volta no frango (5).

### Leva 19: saladas

Muitos pedaços pequenos e coloridos numa tigela. Lição do refogado: forma simples e textura rica, não dezenas de pecinhas.

- Salada de quinoa com abacate (6)
- Salada caprese (9)
- Salada mediterrânea de quinoa (33)
- Salada de cuscuz marroquino (39)
- Salada mediterrânea de grão-de-bico (49)
- Salsa de manga e abacate (43)

### Leva 20: massas e forno

Massa com molho e gratinado.

- Fettuccine alfredo com frango (4)
- Linguine com camarão (10)
- Penne ao pesto com tomate-cereja (46)
- Moussaka (19)
- Spanakopita (38)

### Leva 21: refogados de wok

A mesma técnica do `stirfry.glb`: monte simples e textura assada de um modelo detalhado.

- Refogado de legumes (2)
- Frango teriyaki (42)
- Camarão com aspargo (44)
- Bibimbap (18)

### Leva 22: curries e ensopados

Molho cremoso numa tigela funda, com arroz ou pão do lado. Todos dividem o material de molho brilhante.

- Biryani de frango (11)
- Frango karahi (12)
- Butter chicken (20)
- Curry verde tailandês (21)
- Curry de camarão com coco (37)
- Tagine de grão-de-bico (17)
- Aloo keema (13)

### Leva 23: sopas e verduras cozidas

Caldo visto de cima, com os ingredientes boiando.

- Ramen (16)
- Borscht (27)
- Saag com makki di roti (15)

### Leva 24: grelhados e espetos

Marcas de grelha e tostado. Inclui a volta no frango com salsa de manga, o prato pronto mais fraco das levas anteriores.

- Frango com salsa de manga, nova versão (5)
- Chapli kebab (14)
- Kebab turco (24)
- Espetinho havaiano de frango (47)
- Milho elote (26)

### Leva 25: pães, enrolados e petiscos

Coisas que se pegam com a mão: pão, massa enrolada e fritura.

- Bruschetta de tomate e manjericão (7)
- Bruschetta caprese (41)
- Wrap de falafel (29)
- Rolinho primavera vietnamita (32)
- Enchiladas de frango (36)
- Masala dosa (28)
- Patatas bravas (31)
- Rolinho de pepino e abacate (48)

### Leva 26: doces e bebidas

Confeitaria e copo cheio com enfeite, como o lassi da leva 1.

- Cookies de gotas de chocolate (3)
- Brigadeiros (35)
- Sorvete de matcha (34)
- Smoothie de mirtilo e banana (25)
- Smoothie de abacaxi e coco (50)
- Mojito (40)

As duas smoothies podem ser um modelo só, com a cor do copo em código, como já acontece com a espuma do lassi.
