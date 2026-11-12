---
description: Faz uma leva de modelos 3D inteira, da branch ao merge na main
argument-hint: <número da leva> [direto] [observações]
---

# Leva $ARGUMENTS

Você vai fazer a leva de modelos 3D pedida em `$ARGUMENTS`, do começo ao fim: pegar a leva, modelar no Blender, comparar, trocar no jogo, medir, polir, documentar, commitar e mergear na main. Outras levas podem estar rodando ao mesmo tempo em outras sessões, então trabalhe isolado na sua branch e só toque na main no final.

O primeiro número em `$ARGUMENTS` é a leva de [docs/cozinha/lotes-modelos.md](../../docs/cozinha/lotes-modelos.md). Se vier a palavra `direto`, o usuário já aprovou a leva e você troca no jogo sem esperar a aprovação da comparação. O resto do texto são observações do usuário e valem mais que este roteiro.

## Como ganhar tempo sem perder qualidade

A qualidade vem das lições e da comparação com a referência; o tempo se perde em esperar o Blender, reler documento e repetir medida à mão. Por isso:

- **Rascunho rápido, bake só no fim.** Itere a forma e a cor com `build.py ... --high` (só a prévia do modelo detalhado, uns 5 segundos). O build completo, com bake e `.glb`, roda só quando o rascunho já está bom.
- **Nada de esperar parado.** Rode o Blender em segundo plano e, enquanto ele trabalha, escreva o próximo script. Builds de modelos diferentes podem rodar ao mesmo tempo.
- **Partir do que já existe.** Cada modelo começa do script mais parecido em `art/blender/models/` (fruta a partir de `lime.py` ou `mango.py`, louça e embalagem a partir de `tableware.py`, monte de comida a partir de `stirfry.py`) e das peças de `parts.py`.
- **Tudo da leva de uma vez em cada etapa:** todas as referências num lote só, todas as fichas juntas, uma folha de comparação única, uma rodada de aprovação.
- **Delegar o mecânico.** Busca de quem chama um construtor, levantamento de arquivos e conferência repetitiva vão para um subagente leve (Haiku); modelagem e decisões de visual ficam com você.
- **Parar no ponto certo.** O modelo está pronto quando cabe no orçamento, não repete erro das lições e fica no nível das levas anteriores na comparação. Depois de três rodadas de bake sem convergir, mostre ao usuário o que tem e pergunte, em vez de seguir girando.

## 0. Ler antes de tudo

Leia com atenção o que dá qualidade e só a parte necessária do resto:

1. Inteiros: `CLAUDE.md`, a skill [docs/skills/blender/SKILL.md](../../docs/skills/blender/SKILL.md) e [docs/cozinha/pipeline-blender.md](../../docs/cozinha/pipeline-blender.md) (orçamento e **todas as lições**; nenhum erro anotado ali pode se repetir).
2. De [docs/cozinha/modelos-3d.md](../../docs/cozinha/modelos-3d.md), só "O que os modelos ensinam", "Troca no jogo" e as lições de troca e desempenho. As tabelas de receitas, só se a leva for de prato pronto.
3. De [lotes-modelos.md](../../docs/cozinha/lotes-modelos.md) e [inventario-modelos.md](../../docs/cozinha/inventario-modelos.md), só a sua leva e as linhas dos seus itens.
4. Em `docs/inspiracao/`, só a seção sobre o tipo de item da leva.

## 1. Pegar a leva

1. Confira que ninguém pegou a leva: `git branch --list "lote/*"` e `git worktree list`. Se já existe branch ou worktree da mesma leva, pare e avise.
2. Crie a worktree com a branch, número com dois dígitos e tema curto (exemplo da leva 8):

   ```bash
   git worktree add ../coozinhe-comigo-lote-08 -b lote/08-bulbos main
   ```

   Se a sessão já foi aberta numa worktree própria, só crie a branch nela. Trabalhe só dentro da worktree daqui em diante.
3. `npm ci` na worktree, em segundo plano, enquanto segue para a etapa 2.
4. A configuração `dev` usa a porta 5173 fixa. Se ela estiver ocupada por outra leva, acrescente em `.claude/launch.json` uma entrada `dev-NN` na porta `51NN` e **nunca commite essa mudança** (`git restore .claude/launch.json` antes de cada commit).
5. Monte a lista de tarefas com as etapas abaixo.

## 2. Referência e fichas

1. Renderize de uma vez, em segundo plano, a referência de todos os itens com `art/blender/ref.py` (modelos de `C:\Users\kitsu\Documents\cook-soundtrack\models\extracted`). Veja os quadros do vídeo de gameplay só quando o modelo extraído não mostrar o item.
2. Enquanto renderiza, escreva a ficha curta de cada modelo, como manda a skill: o que é, tamanho, ângulo da câmera, materiais, orçamento de triângulos e textura. Desvio da ficha é defeito.
3. Olhe as referências e anote em `docs/inspiracao/` o que elas fazem melhor (cor, degradê, brilho, corte, enfeite), poucas linhas por item. O que vier de vídeo ou quadro é inferência e fica marcado assim. Nunca copie arquivo, malha ou textura de lá.

## 3. Medida de antes

Só se a leva troca procedurais que já estão no jogo. Antes de mexer, com o servidor de desenvolvimento no ar, abra `art/scene.html?shot=<plano>` e chame `window.stats()` em cada plano que mostra os itens, num laço só pelo `javascript_tool`. Na feira, fixe o sorteio (`Math.random`) antes. Guarde os números; o depois usa exatamente o mesmo método.

## 4. Modelar no Blender

1. Um script por modelo em `art/blender/models/<nome>.py`, partindo do script mais parecido. Peça que serve a outras levas vai para `parts.py`.
2. Itere no rascunho até a silhueta e a cor ficarem certas:

   ```bash
   "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P art/blender/build.py -- <modelo> <pasta-das-previas> --high
   ```

3. Depois, o build completo (o mesmo comando sem `--high`), em segundo plano. A pasta das prévias fica no scratchpad da sessão, fora do repositório.
4. Olhe de verdade cada prévia (`<modelo>.png`, `<modelo>_high.png`, as fotos de cada peça) e confira o `<modelo>.json` contra o orçamento. Não suba polígono que não aparece na tela.
5. Cada peça é escrita no referencial do procedural que ela troca, e o nó do `.glb` leva o nome que o jogo vai procurar.

## 5. Comparar e aprovar

1. Monte **uma folha só** com a leva inteira: uma página HTML no scratchpad com, para cada item, referência, modelo atual (`/art/compare-current.html?item=<item>`, quando existe) e modelo novo lado a lado, e os números (triângulos, textura, KB). Item novo compara só referência e novo.
2. **Sem `direto`:** mostre a folha e espere a aprovação. Enquanto espera, adiante a troca no jogo na sua branch (etapa 6); ela só é commitada depois do sim. Ajuste o que o usuário pedir e mostre de novo só os itens que mudaram.
3. **Com `direto`:** siga, e ponha a folha no relatório final.
4. Se o modelo atual for melhor que o novo (lição 7 do pipeline), diga isso em vez de trocar.

## 6. Trocar no jogo

Siga "Troca no jogo" de `modelos-3d.md`. Em resumo:

1. O procedural sai do caminho do jogo e vai para `src/three/archive/` (arquivado, nunca apagado), no arquivo do mesmo tipo (`procedural.js`, `sets.js`, `station.js`) ou num novo. Textura que só ele usava vai junto.
2. O `.glb` entra em `public/models/` e o nome na lista `MODELS` de `src/three/models.js`. Use `model()`, `part()` e `dish()`; carregue uma vez, divida geometria e material entre as cópias.
3. O que muda durante o minijogo continua em código. Guarde referências em `userData`, nunca dependa da ordem dos filhos.
4. **Item novo sem receita jogável:** o script e o `.glb` entram no repositório, mas o nome **não** entra em `MODELS`, para o jogo não baixar o que não usa. Anote que ele está pronto e fora do jogo, esperando a receita.
5. Aproveite para deixar o jogo mais leve: reaproveitar geometria e material, tirar código que ficou sem uso.

## 7. Conferir, medir e polir

1. `npm test` e `npm run build` passam.
2. Foto e `window.stats()` de cada plano afetado em `art/scene.html`, no mesmo laço da medida de antes. Olhe as fotos no jogo, não só no estúdio (lição 12 de `modelos-3d.md`): cor, escala, posição, sombra, brilho de metal e vidro.
3. Uma partida rápida (`?speed=4`) de cada receita que usa os itens, passando por feira, bancada e prato pronto. Console sem erro novo.
4. Se o número piorou sem motivo, ache o culpado escondendo um nó de cada vez. Corrija o que ficou estranho, gere de novo e confira só o que mudou.

## 8. Documentar

Escreva uma vez, no fim, curto e em português simples:

1. `modelos-3d.md`: a seção da leva (o que entrou, triângulos e KB, como ficou a troca, antes e depois) e as lições novas de troca e desempenho, no fim da lista.
2. `pipeline-blender.md`: as lições novas de modelagem, no fim da lista. Toda lição nasce de um erro de verdade: uma frase de regra e uma de porquê. Se algo deixou a leva mais lenta sem motivo, anote também, para a próxima sair mais rápida.
3. `lotes-modelos.md`: marque a leva como feita (data e o que ficou fora do jogo). `inventario-modelos.md`: mova os itens para "Já no Blender".

## 9. Commitar

Commits pequenos e atômicos, em Conventional Commits, cada um compilando e passando nos testes:

1. `feat(blender): ...` para mudanças em `lib.py`, `parts.py` ou `build.py`.
2. `feat(models): add blender <tema> (batch NN)` com os scripts e os `.glb`.
3. `feat(game): swap <tema> to blender models` com a troca e o arquivamento.
4. `docs(cozinha): log batch NN, numbers and lessons`.

Adicione os arquivos pelo nome, nunca `git add -A`, e revise o diff antes de cada commit. Não commite prévias, `.blend`, nem a mudança de porta do `launch.json`.

## 10. Mergear na main

1. Na worktree: `git rebase main`.
2. Conflitos prováveis:
   - lista `MODELS` em `models.js`: manter os nomes das duas levas;
   - lições numeradas em `pipeline-blender.md` e `modelos-3d.md`: manter as duas, as suas depois, renumeradas para seguir a sequência;
   - `lotes-modelos.md` e `inventario-modelos.md`: manter as marcações das duas levas.
3. Depois do rebase, `npm test` e `npm run build` de novo. Se a outra leva mexeu nos mesmos arquivos de cena, refaça as fotos dos planos afetados.
4. Avance a main pela pasta principal, só se ela estiver limpa e na main:

   ```bash
   git -C C:/Users/kitsu/Documents/roberta/coozinhe-comigo merge --ff-only lote/NN-tema
   ```

   Se a main andou de novo, volte ao passo 1. Se a pasta principal tiver mudança não commitada, pare e avise; nunca mexa nela.
5. Se o repositório tiver remoto, faça push da main. Hoje ele não tem.
6. Remova a worktree e a branch: `git worktree remove ../coozinhe-comigo-lote-NN` e `git branch -d lote/NN-tema`.

Nada disso toca produção. Se alguma etapa pedir deploy ou algo fora do repositório, pare e pergunte.

## 11. Relatório final

Curto, em português simples: o que entrou no jogo, o que ficou fora e por quê, a folha de comparação, os números de antes e depois, as lições novas e o que não foi verificado.
