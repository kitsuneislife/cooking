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

## Avisos

- Algumas etapas do vídeo são só "toque várias vezes". Entre duas etapas seguidas, mudamos o gesto.
- A contagem em cima do alimento tapa o que se vai fazer. O nosso "Já!" fica no meio da tela por menos de um segundo.
