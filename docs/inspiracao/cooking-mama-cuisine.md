# Inspiração: Cooking Mama: Cuisine! (Apple Arcade)

Anotações de um vídeo de 30 minutos de gameplay, visto em 11/11/2026. Tudo aqui é **inferência**: foi lido dos quadros do vídeo, sem fonte escrita. Complementa [cooking-mama.md](cooking-mama.md), que cobre a série com fontes.

Vale a mesma regra de sempre: levamos mecânica e sensação, nunca a Mama, o nome, o logotipo, as falas, a música ou a arte.

## Como uma receita anda

- Antes de cozinhar, uma mesa com os ingredientes e utensílios: o jogador toca nos que vai usar e os outros ganham um "x". É a nossa feira.
- A receita aparece como uma fila de ícones de etapa. A etapa da vez pula com um selo "vamos lá".
- Cada etapa dura de 5 a 20 segundos e termina com a mascote na frente da tela e até 3 estrelas.
- No fim, o prato pronto aparece sobre uma toalha de renda, com um título de parabéns, as estrelas e uma barra de pontos que enche.

## A tela de uma etapa

- Relógio de cozinha no canto de cima, à esquerda.
- Em cima, no meio, a barra da etapa: ou uma barra que enche, ou uma fila de carinhas, uma para cada ação contada (5 cortes, 5 carinhas).
- Uma faixa com a ordem em duas ou três palavras ("Peneire!", "Abra a massa!") e, ao lado, um balão curto com a dica.
- Contagem 3, 2, 1 em cima do próprio alimento antes de valer.
- O nome do ingrediente da vez aparece numa plaquinha embaixo.
- A câmera fica de cima e bem perto. O alimento e o utensílio ocupam quase a tela toda, sobre um jogo americano estampado.

## Minijogos vistos

| Etapa | Gesto | O que mede |
|---|---|---|
| Peneirar farinha | balançar a peneira para os lados | barra enche |
| Batedeira | segurar o botão com o ponteiro na faixa verde (verde, amarelo, vermelho) enquanto os ingredientes entram um a um | tempo na faixa |
| Abrir a massa | rolo para cima e para baixo | massa cresce até o contorno |
| Cortar com cortador | carimbar a massa numa grade | carinhas |
| Fritar por imersão | soltar na panela e tirar para a grade quando doura | ponto de cada peça |
| Pesar na balança | despejar até o número pedido | distância do alvo |
| Temperar | sal e pimenta, um de cada lado, até a medida | barra |
| Selar na frigideira | barra de ponto com ponteiro, e virar na hora | ponto |
| Arrancar o cabinho do morango | puxar quando o marcador passa na faixa | tempo certo |
| Descascar | puxar o descascador de cima a baixo, tira por tira | carinhas |
| Fatiar | toques, com a mão segurando o alimento | carinhas |
| Refogar na panela | mexer e controlar o fogo, com barras de ponto ao lado | ponto de cada ingrediente |
| Empanar no açúcar | arrastar a bolinha pela bandeja | cobertura |

## Visual

- Tudo muito claro e saturado: amarelo, rosa, azul-piscina, lilás. Quase nenhuma sombra dura.
- Utensílio grande, liso, com cara de brinquedo. A comida é o que tem textura.
- Acerto solta estrelinhas e corações em cima do alimento. Erro é só uma carinha triste, sem punição longa.
- A mascote aparece grande entre as etapas, com poucas poses bem lidas: feliz, olhos de coração, surpresa.

### Visual em detalhe (revisto em 12/11/2026)

Quadros tirados a cada minuto do mesmo vídeo, olhando só para luz, cor e acabamento.

- **Luz alta e macia.** O quadro inteiro é claro; a sombra é só um contato suave embaixo de cada peça. Nada fica preto: até o fundo da panela é cinza azulado.
- **Tampo amarelo.** A comida quase sempre fica sobre réguas de madeira amarelo-mel, com veio leve. Por cima vai um jogo americano estampado (xadrez rosa, lilás com desenho branco) com costura na borda.
- **Cozinha em tons pastel.** Parede verde-menta com listras claras, azulejo em quadrados de cores misturadas (rosa, menta, amarelo, lilás), armário rosa com puxador branco.
- **Utensílio de brinquedo.** Panela de esmalte azul-piscina com alça azul, fogão branco com trempe colorida, batedeira amarela. Plástico liso, reflexo limpo do ambiente, borda arredondada.
- **Comida com textura e brilho úmido.** A carne tem veio de gordura e um reflexo molhado; a massa frita tem degradê do claro ao dourado.
- **Prato pronto em toalhinha de renda** branca, recortada na borda.
- **Efeitos fofos e coloridos.** Estrelas de quatro pontas em amarelo, rosa e menta, coraçõezinhos, nuvens de vapor redondinhas, bolhas na água. Um brilho suave (bloom) só nos pontos mais claros.
- **Borda lisa.** Nenhum serrilhado nem cintilação; tudo parece bem acabado.

### A comida de perto (revisto em 12/11/2026, para os modelos 3D)

Quadros a cada 30 segundos, olhando só para a comida. Também é inferência.

- **Comida quase foto, utensílio brinquedo.** O contraste é o segredo: a panela é lisa e de uma cor só, e a carne, o morango e a cebola têm textura de foto. Se a comida ficar lisa como o utensílio, tudo vira plástico.
- **A comida ocupa a tela.** No close, o alimento enche metade do quadro; não existe "pecinha pequena" que precise ser lida de longe.
- **Brilho onde é molhado.** Morango e carne crua têm um ponto de luz forte e pequeno; creme batido e massa ficam foscos. Um brilho espalhado em tudo deixa a comida com cara de vela.
- **Creme em roseta** de bico pitanga, com sulcos em espiral, é o enfeite de sobremesa mais repetido.
- **O prato pronto** fica num prato branco de borda azul, por cima da toalhinha de renda, com fruta inteira e cortada em volta.
- **Corte mostra o miolo.** Cebola, batata e cenoura aparecem cortadas na tábua, com o miolo mais claro que a casca.

Como isso vira modelo está em [../cozinha/pipeline-blender.md](../cozinha/pipeline-blender.md).

## O que levamos

| Ideia | Onde entrou |
|---|---|
| Uma estação por tipo de etapa, com câmera de cima e perto | `SHOTS` em `src/three/world.js` |
| Estrelas no fim de cada etapa, não só no fim da receita | carimbo em `MinigamePhase` |
| Segurar o ponteiro na faixa verde | liquidificador (`blend`) |
| Balançar para os lados | peneirar e temperar (`shake`) |
| Rolo para cima e para baixo | abrir a massa (`roll`) |
| Ponto com ponteiro e hora de tirar | forno e geladeira (`wait`), grelha (`fry`) |
| Cobrir uma superfície arrastando | molho da pizza e creme do tiramisù (`spread`) |
| Soltar na hora certa | pôr no copo, no liquidificador e na tigela (`drop`) |
| Prato pronto sobre uma toalha, com brilho | revelação no fim da fase de cozinhar |
| Luz alta, sombra macia, borda sem serrilhado | luz e pós-processamento em `src/three/world.js` |
| Tampo amarelo, parede menta, azulejo pastel, armário rosa | `buildKitchen` em `src/three/sets.js` |
| Jogo americano estampado e toalhinha de renda | `placemat` e `doily` em `src/three/sets.js` |
| Estrelas coloridas, corações e vapor redondo | `Particles` em `src/three/world.js` |
| Guia no centro de cada etapa: anel girando para mexer, setas para o zigue-zague, chevrons no corte, ondas para tocar, anel enchendo para segurar | `src/components/Guide.jsx`, cada jogo chama `ctx.guide` |
| Comida úmida e com cor de dar fome: carne selada dourada, picadinho brilhante | `searedBeef` em `src/three/kit.js`, `pile` em `mince.js` |
| Transições sem corte seco: cartão e carimbo saem com um pulinho, íris de estrela em papel rosa de bolinhas entre lugares longe, giro final que nasce de onde a câmera está | `travelTo` em `MinigamePhase.jsx`, `.wipe` em `src/styles.css`, `orbit` em `world.js` |
| Nada trava no meio de um movimento: texturas pintadas e shaders compilados antes, com a câmera parada ou a tela coberta | `paintAll` em `kit.js`, `warm` em `world.js` |

## Menus (revisto em 12/11/2026)

Quadros do começo do vídeo (título, menu principal, "como jogar", livro de receitas, "carregando") e do fim de cada receita.

- **Tela de título.** O logotipo fica numa placa rosa com borda de renda, por cima de uma cozinha clara e de uma pilha de legumes. A mascote entra pela direita, grande, com uma frigideira na mão.
- **Menu principal.** Três "ilhas" redondas, cada uma com um personagem fazendo uma coisa (trocar o visual, cozinhar, ler o livro). Embaixo de cada uma, um botão em pílula azul-piscina com texto branco. A mãozinha aponta o botão da vez.
- **Painéis.** Fundo branco, moldura grossa azul-clara com uma fileira de coraçõezinhos pontilhados, e um fio dourado por fora. O título do painel é amarelo com contorno azul-escuro e, embaixo, um traço laranja que termina em pontinhos, como uma colher.
- **Faixa de título.** Pílula rosa-clara com borda vinho e uma costura branca tracejada por dentro ("Beef Steak", "Dessert Recipes").
- **Botões de canto.** Voltar é um quadrado lilás arredondado com seta; fechar é um quadrado de xadrez rosa com um X vermelho.
- **Livro de receitas.** Caderno de duas páginas com espiral no meio e setas verdes para virar. Cada receita é uma foto com moldura branca sobre papel colorido, três estrelas em cima e o nome numa fita adesiva estampada embaixo. Bolinha vermelha marca o que é novo.
- **"Como jogar".** Três quadros em fila, "Passo 1, 2, 3", com a imagem de cada parte e o nome embaixo.
- **Carregando.** Mosaico de quadrados em tons de bala (amarelo, rosa, verde, azul) com legumes em relevo, e a carinha da mascote no meio.
- **Prato pronto.** Sobre toalhinha de renda numa mesa de madeira amarela, com três estrelas grandes em pedestais e a mascote com olhos de coração.

### O que levamos para os nossos menus

| Ideia | Onde entrou |
|---|---|
| A tela fora da partida é a mesma cozinha do jogo: parede menta listrada, faixa de azulejo pastel e tampo amarelo | fundo do `body` em `src/styles.css` |
| Logotipo numa placa recortada com renda, letras gordas e uma colher embaixo | `src/components/Logo.jsx` |
| Painel branco com moldura azul de coraçõezinhos e fio dourado | `.panel` e `.book` em `src/styles.css` |
| Faixa de título rosa com costura | `.ribbon` |
| Pedido como foto sobre toalhinha de renda, nome em fita adesiva | `RecipeCard` |
| Receita como caderno de duas páginas com espiral no meio | `RecipeDetail` |
| Botão voltar quadrado lilás no canto | `.corner-btn` |
| "Como jogar" com três quadros e a imagem de cada parte, tirada da própria cozinha 3D | `world.snapshot` e o pedido em `Play.jsx` |
| Chef com poucas caras bem lidas, piscando e respirando | `src/components/Chef.jsx` |

O mascote, o nome, o logotipo, as falas e a arte continuam sendo só deles: nosso chef, nossa placa e nossas cores são desenhos próprios.

## Avisos

- Algumas etapas do vídeo são só "toque várias vezes". Entre duas etapas seguidas, mudamos o gesto.
- A contagem em cima do alimento tapa o que se vai fazer. O nosso "Já!" fica no meio da tela por menos de um segundo.
