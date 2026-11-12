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

Saem `public/models/stirfry.glb` e, na pasta das prévias, `stirfry_high.png` (o modelo detalhado), `stirfry.png` (o que vai para o jogo), `stirfry.blend` e `stirfry.json` (triângulos e tamanho). A referência:

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
