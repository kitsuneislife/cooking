# Pipeline dos modelos 3D no Blender

Como fazer e refazer um modelo de comida do jogo no Blender, do estudo da referência até o `.glb` que o jogo carrega. Começou em 12/11/2026, com a leva 2 do aprimoramento visual (ver [modelos-3d.md](modelos-3d.md)). As lições de cada leva entram no fim deste arquivo.

## O pedido (para não precisar explicar de novo)

O visual 3D do jogo passa por um refactor **progressivo**: uma leva de cada vez, trocando os modelos por versões mais bem-feitas, mais leves e com cara de comida gostosa ("tasty"). A régua de qualidade são os modelos e o vídeo de gameplay de *Cooking Mama: Cuisine!* em `C:\Users\kitsu\Documents\cook-soundtrack` (pasta `models/extracted` e o `.mp4` de 30 minutos). A gente estuda e se inspira fortemente, mas **nenhum arquivo, textura ou malha de lá entra no jogo**: os modelos são deles.

Cada leva:

1. Escolhe alguns ingredientes e pratos do MVP (as receitas de `MENU` em `src/data/games.js`).
2. Estuda a referência: o modelo parecido em `models/extracted` e os quadros do vídeo.
3. Modela no Blender, pelos scripts de `art/blender/`, pensando em desempenho desde o começo: dentro do orçamento abaixo, sem polígono que não aparece na tela.
4. Compara lado a lado: a referência, o modelo atual do jogo e o novo.
5. Depois que o usuário aprova, troca no jogo: o procedural vai para `src/three/archive/` (arquivado, não apagado) e o jogo carrega o `.glb` por `src/three/models.js`, medindo triângulos e chamadas de desenho antes e depois. O como está em [modelos-3d.md](modelos-3d.md), em "Troca no jogo".
6. Anota toda lição e todo erro consertado (aqui, os de modelagem; em [modelos-3d.md](modelos-3d.md), os da troca e de desempenho) e o progresso. Cada leva tem que sair melhor e mais rápida que a anterior.

## Por que script, e não arquivo `.blend`

Cada modelo é um script Python (`art/blender/models/<nome>.py`) que o Blender roda sem abrir a janela. O script é a fonte: dá para ler no diff, mudar um número e gerar de novo, e as peças comuns (prato, paninho, florete, folha, roseta, limão) ficam num lugar só, em `art/blender/parts.py`. O `.blend` é só um resultado, salvo junto das prévias para inspecionar e nunca versionado.

O MCP do Blender também funciona, mas pede o Blender aberto com o servidor ligado na porta 9876. O modo sem janela não depende disso, e é o que o pipeline usa.

## Os arquivos

| Arquivo | Papel |
|---|---|
| `art/blender/lib.py` | Cena de estúdio, materiais em degradê, geometria, low poly, bake e exportação. |
| `art/blender/parts.py` | Peças reaproveitadas entre modelos. |
| `art/blender/models/<nome>.py` | Um modelo. A função `build()` devolve as partes. |
| `art/blender/build.py` | Monta, assa, exporta e renderiza um modelo. |
| `art/blender/ref.py` | Renderiza um modelo de referência na mesma luz, só para comparar. |
| `art/compare-current.html` | Foto do modelo atual do jogo, sozinho, com a luz do jogo (abrir pelo servidor de desenvolvimento). |
| `public/models/<nome>.glb` | O que o jogo carrega, por `src/three/models.js` (nome novo entra na lista `MODELS`). |

## Rodar

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P art/blender/build.py -- stirfry <pasta-das-previas>
```

Com `--high` no fim, sai só `stirfry_high.png`, sem bake nem `.glb`, em uns 5 segundos: é o rascunho para acertar forma e cor antes do build completo. Sem ele, saem `public/models/stirfry.glb` e, na pasta das prévias, `stirfry_high.png` (o modelo detalhado), `stirfry.png` (o que vai para o jogo), `stirfry.blend` e `stirfry.json` (triângulos e tamanho). A referência:

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P art/blender/ref.py -- "C:/Users/kitsu/Documents/cook-soundtrack/models/extracted/Meat and Vegetable Stir-Fry" ref.png
```

O modelo atual do jogo: `npm run dev` e abrir `/art/compare-current.html?item=stirfry` (os itens estão no próprio arquivo). Pratos que o jogo monta dentro dos minijogos (frango com salsa, tiramisù) são uma reconstrução aproximada com as mesmas peças.

## Como um modelo é feito

**Duas versões do mesmo modelo.** O modelo detalhado (*high*) tem todas as peças: cada grão de arroz, cada tira de carne, cada botão de brócolis. Ele nunca vai para o jogo. O modelo do jogo (*low*) é um casco simples, e o detalhe do high é assado (*bake*) na textura dele. É o que a referência faz: forma simples, textura rica.

Uma parte em `build()` é um dicionário:

```python
{"name": "stirfry_food", "high": [...], "tris": 5000, "voxel": 0.018, "size": 1024}
```

- `voxel`: funde as peças num volume só (remesh por voxel) antes de simplificar. Serve para montes de comida, em que as peças se encostam. Sem `voxel`, o low é o high juntado e simplificado, o que serve para peças com forma limpa (limão, manga inteira).
- `tris`: o teto de triângulos do low.
- `size`: o lado da textura.
- `keep: True`: a parte vai como está, sem bake, porque tem cor lisa (o prato e a borda).
- `roughness: False`: não assa o brilho, para peça toda fosca (o paninho).

**O bake** gera três texturas: cor com a oclusão pintada por cima (o vão fica mais escuro, como nas texturas da referência), relevo (normal map) e brilho (roughness, para o molho brilhar e o arroz ficar fosco no mesmo modelo). O `.glb` sai com as texturas em WebP.

**Materiais.** `lib.ramp_mat` faz quase tudo: um degradê de 2 a 5 cores, que pode seguir ruído, altura (`by="height"`, o sol e a oclusão pintados) ou distância ao centro (`by="radial"`), mais relevo. `cells=` troca o relevo por bolinhas (Voronoi) com o vão escurecido: botões do brócolis, vesículas do limão, poros do biscoito.

## Orçamento

| Tipo | Triângulos no jogo | Textura | `.glb` |
|---|---|---|---|
| Ingrediente da feira | até 3.000 | 512 | até 300 KB |
| Prato pronto (com prato e paninho) | até 10.000 | 1024 na comida, 512 no resto | até 900 KB |
| Cenário perto da câmera (módulo da bancada, janela, banca da feira) | até 2.000 no que repete, 5.000 a 12.000 na peça única | 1024 | até 700 KB |
| Cenário de fundo (prateleira, coifa, luminária, barracas) | até 5.000 por peça | 512 (1024 só nas barracas) | até 1 MB o arquivo |
| Placa que repete (azulejo) | 2 (um quad) | 1024 | até 100 KB |

O high pode ter o tamanho que precisar (o refogado tem 140 mil triângulos), porque não sai do Blender.

## Lições

Cada uma custou um erro. Vale ler antes de mexer.

1. **`matrix_world` só vale depois de `view_layer.update()`.** Mudar `location` e logo ler ou escrever `matrix_world` usa o valor velho: os floretes caíram todos na origem e a câmera enquadrou o vazio. Para compor transformações, usar `matrix_basis`.
2. **Esfera UV tem polo.** Deformada com ruído, o polo vira uma mancha escura no topo do florete. Para comida redonda deformada, usar icosfera.
3. **Corte plano e liso espelha a luz e fica branco.** O miolo do limão estava verde na textura e branco no render. Face de corte pede roughness de 0,35 para cima.
4. **`create_grid(calc_uvs=True)` só preenche UV se a camada já existe.** Sem ela, o xadrez do paninho assou cinza liso e sumiu no fundo branco.
5. **O recheio do monte não pode aparecer.** No refogado, o domo de baixo (que tapa os buracos) ficou maior que as peças e o prato virou uma bola de molho. O recheio fica mais baixo e mais escuro, e as peças são grandes em relação ao monte: a tira de carne tem uns 70% do raio do monte.
6. **Dois pontos escuros lado a lado viram olhos.** Os grãos de café em cima do tiramisù fizeram uma carinha. Enfeite escuro e pequeno vai no prato, ou em número ímpar.
7. **O modelo atual pode ser melhor do que parece.** O brócolis do jogo já tinha boa silhueta. A comparação lado a lado decide; não trocar só porque é novo.
8. **Peça composta guarda o recuo na malha, não em `location`.** A membrana do meio limão ficava um pouco abaixo dos gomos por `location`; o modelo que usa a peça posiciona todas as partes por `location` e apagou o recuo. A membrana encostou na polpa, ganhou a briga de profundidade e o corte ficou branco. Deslocamento interno vai para a malha (`data.transform`). Para achar esse tipo de culpado, renderizar só algumas partes de cada vez.
9. **A comida tem que encher o prato.** Com o prato no tamanho do refogado, o frango ficou miúdo e o prato virou o assunto. Na referência a comida ocupa uns dois terços do prato.
10. **Pane escondido para o relógio do jogo.** Para fotografar o jogo, usar `art/compare-current.html`, e não esperar uma partida inteira rodar sozinha.

Lições da leva 3 (cenário):

11. **Cenário se modela nas medidas do jogo.** `lib.T` troca o eixo do jogo (y para cima) pelo do Blender, e `lib.box` faz caixa arredondada já em unidades do jogo. Copiar a posição de `src/three/sets.js` evita medir de novo depois. Quando o jogo é que posiciona a peça (janela, luminária), `"origin"` leva o nó para a origem antes de exportar.
12. **O que repete vira módulo ou placa.** A bancada é um módulo de armário que o jogo repete 12 vezes numa malha só. A parede é uma placa de 6 colunas de azulejo (a sequência de cores fecha a cada 6) assada num quad com UV inteira (`"low"` pronto): o jogo estica e repete a textura. Dois triângulos no lugar de três planos e um filete.
13. **Peças do high não se encostam por dentro.** O montante da porta passava por dentro da travessa, e a oclusão assou um quadrado escuro em cada canto. Cortar o montante na altura da travessa.
14. **Oclusão de cenário pede amostras.** Com 16 amostras a oclusão saiu granulada nas superfícies grandes e lisas. Cenário usa `"samples"` de 48 a 64.
15. **Madeira de cenário é discreta.** Veio forte e junta larga parecem desenho; as cores do degradê ficam próximas e o chanfro entre réguas é de 0,012.
16. **O nó do `.glb` leva o nome da peça.** Se uma peça do high já tem esse nome, o Blender chama o low de `spice.001` e o jogo vê `spice001`. O `build.py` agora renomeia a peça do high antes.
17. **Prévia de peças espalhadas sai vazia.** As miudezas ficam em pontos distantes da cozinha, e o estúdio enquadra a origem. Para cenário, a prova é a foto no jogo (`art/scene.html?shot=wide`).
18. **Casco simplificado longe do detalhe assa buraco.** Nas barracas do fundo, o low de 12 mil triângulos ficou afastado das peças, e com extrusão de 0,03 o raio não alcançava: o balcão saiu com uma mancha marrom e as copas com pintas escuras. Peça de fundo simplificada usa extrusão de 0,2.
19. **Veio forte em área grande vira mancha.** Os degraus da banca pareciam cortiça; o degradê da madeira encurtou para tons vizinhos.
20. **Fundo pequeno na tela não precisa de detalhe.** As prateleiras com 9.000 triângulos cada deixaram o quadro mais pesado que o cenário antigo; com 5.000 a diferença não aparece.

Lições das levas 4 e 5 (louça e utensílios):

21. **Metal assa preto.** A cor de um material metálico sai preta no bake. O high de metal é pintado como não-metal (`parts.steel()`, um degradê claro) e o low ganha `"metal": 1` com `"roughness": False` e um `"rough"` fixo: o glTF lê o metal do canal azul do mapa de rugosidade, então peça de metal não leva esse mapa.
22. **Superfície aberta de torno inverte a normal.** Fora, borda e dentro da tigela como malhas separadas recalculam a normal cada uma para um lado, e o fundo de dentro assou preto. `lib.solid` junta as partes, solda e recalcula como um sólido fechado. Perfil de torno sempre fecha (começa e termina no eixo ou emenda com a peça vizinha).
23. **Voxel esfarela grão.** O monte de arroz em voxel virou farelo. Para miudeza sobre uma forma lisa, o casco é feito à parte (`"shell"`, um domo na altura média dos grãos) e os grãos só vão para a textura. O `build.py` esconde do bake o casco que não está no high.
24. **Filete e bolinha não custam triângulo.** Os filetes dourados do prato, as faixas da tigela de molho e as pintas ficam fora do `"shell"`: o casco é só o corpo, e o detalhe vai para a textura.
25. **A oclusão padrão escurece a tigela inteira.** O alcance padrão do AO (10) é maior que a tigela, e o dentro saiu cinza. Louça funda usa `"ao": 0.4`; utensílio pequeno, 0,3.
26. **Peça que gira assa longe das vizinhas.** O disco do cortador de pizza encostava no garfo, e a oclusão manchou um lado. Afastar no Blender (`parts.shift`) e trazer de volta pelo `"origin"`.
27. **Com muitas peças, a prévia geral não serve.** O `build.py` agora tira uma foto de perto de cada peça (`<modelo>_<peça>.png`). O estúdio não tem reflexo, então metal parece cinza fosco na prévia: metal se julga no jogo.
28. **Cada peça no referencial do procedural que troca.** Escrever o modelo na posição local do objeto antigo (ponta da colher na origem, fio da faca em y = 0) deixa os minijogos sem mudança nenhuma. `parts.xform` posiciona como o three.js (posição e rotação XYZ do jogo).
29. **Veio de madeira largo vira listra de longe.** Na tábua, o ruído de veio com `scale` 1,2 parecia madeira na foto de perto e listras onduladas no plano do jogo. Com `scale` 4 e as três cores da rampa bem próximas, o veio fica calmo nas duas distâncias.
30. **Pinta clara em fundo claro some.** A tigela de misturar com fundo creme e pintas azuis lia como branca no jogo. Inverter (fundo azul, pintas creme) devolveu a cor que o jogador já conhecia.

Lições da leva 7 (embalagens):

31. **O rótulo é uma folha à parte.** Texto e cor mudam por ingrediente, então o rótulo vai como peça `"keep"` com UV inteira (`parts.label_band` para cilindro, `parts.label_panel` para face plana, com shrinkwrap para colar no corpo) e o jogo troca a imagem. Assim um formato serve a dezenas de ingredientes.
32. **Peça `"keep"` fica fora do bake.** O rótulo encostado no pote fazia sombra e assou uma faixa escura no corpo. O `build.py` agora esconde as peças `"keep"` durante o bake e mostra de novo na prévia.
33. **Peça `"keep"` com `"origin"` leva a posição para a malha.** O rótulo afastado por `parts.shift` voltava pela `location` mas o `"origin"` só move a malha, e ele ficava longe do pote. O `build.py` agora grava a matriz na malha antes de mover.
34. **Peça que o jogo tinge sai quase branca.** Tampa, telhado e lata são assados num degradê claro (`tintable`); o jogo multiplica pela cor do ingrediente. Assar já colorido deixaria todo leite azul.
35. **`fill` abaixo de 1 corta peça comprida.** O `lib.frame` aproxima a câmera pela metade da diagonal vezes `fill`, então a fila de embalagens e o tablete de manteiga saíram cortados na prévia. Para a foto da comparação, abrir o `.blend` e enquadrar de novo com `fill` de 1,2 a 1,5.
36. **Dobra de papel não é caixa.** A boca do saco feita com duas caixas empilhadas parecia uma tampa, e as abas da manteiga, duas placas triangulares sobrepostas e uma emenda saltada no topo, viraram degraus nas quinas. Dobra se faz como folha: um caminho varrido na largura (a boca que enrola por cima e desce colada na frente) ou uma aba fina deitada na face, dentro do chanfro. Emenda que não ajuda a ler o objeto fica escondida embaixo.

Lições da leva 6 (vidros e garrafas):

37. **Friso de torno só aparece onde há vértice.** Na primeira tentativa, a faixa dos frisos das tampas caía entre dois anéis do perfil e saiu lisa. A faixa (`parts.ridged`, de `z0` a `z1`) precisa cobrir as alturas dos anéis da parede da tampa, e o friso precisa de profundidade de uns 4% do raio (0,016) para sobreviver ao assado.
38. **Letra em relevo fina e espaçada.** Com `bold` alto, as letras do PIMENTA engordavam e grudavam umas nas outras. `bold` 0,004, `space_character` 1,15 e a palavra comprida menor que a curta (0,085 contra 0,14) deixam as duas legíveis no tamanho do jogo (`parts.lettering`).
39. **Rampa da peça tingida não termina em branco puro.** Como na lição 34, a tampa sai assada quase branca e o jogo multiplica a cor por cima. Mas a rampa do saleiro que terminava em branco puro sumia no realce; terminar num tom claro (o `light` de `bottles.shaker`) segura a cor.
