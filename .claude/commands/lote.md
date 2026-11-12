---
description: Faz uma leva de modelos 3D inteira, da branch ao merge na main
argument-hint: <número da leva> [direto] [observações]
---

# Leva $ARGUMENTS

Você vai fazer a leva de modelos 3D pedida em `$ARGUMENTS`, do começo ao fim: pegar a leva, modelar no Blender, comparar, trocar no jogo, medir, polir, documentar, commitar e mergear na main. Outras levas podem estar rodando ao mesmo tempo em outras sessões, então trabalhe isolado na sua branch e só toque na main no final.

O primeiro número em `$ARGUMENTS` é a leva de [docs/cozinha/lotes-modelos.md](../../docs/cozinha/lotes-modelos.md). Se vier a palavra `direto`, o usuário já aprovou a leva e você troca no jogo sem esperar a aprovação da comparação. O resto do texto são observações do usuário e valem mais que este roteiro.

## 0. Ler antes de tudo

Leia inteiros, nesta ordem, e siga o que eles mandam. Eles são a fonte; este roteiro só amarra as etapas.

1. `CLAUDE.md` do projeto.
2. [docs/skills/blender/SKILL.md](../../docs/skills/blender/SKILL.md), a skill de Blender.
3. [docs/cozinha/pipeline-blender.md](../../docs/cozinha/pipeline-blender.md): pedido, arquivos, orçamento e **todas as lições**. Nenhum erro anotado ali pode se repetir.
4. [docs/cozinha/modelos-3d.md](../../docs/cozinha/modelos-3d.md): o que a referência ensina, as levas feitas, "Troca no jogo" e as lições de desempenho.
5. [docs/cozinha/inventario-modelos.md](../../docs/cozinha/inventario-modelos.md) e [docs/cozinha/lotes-modelos.md](../../docs/cozinha/lotes-modelos.md): os itens da leva, os construtores atuais e o que fica em código.
6. Em `docs/inspiracao/`, o que já foi anotado sobre o tipo de item da leva (por exemplo `cooking-mama-cuisine.md`, "Louça e utensílios de perto").

Use as skills que o projeto e o usuário já têm (blender, as de escrita para os textos que o usuário lê, as de revisão de código) em vez de reinventar o processo.

## 1. Pegar a leva

1. Confira que ninguém pegou a leva: `git branch --list "lote/*"` e `git worktree list`. Se já existe branch ou worktree da mesma leva, pare e avise.
2. Crie uma worktree com uma branch nova a partir da main, com o número da leva com dois dígitos e o tema curto. Exemplo para a leva 8:

   ```bash
   git worktree add ../coozinhe-comigo-lote-08 -b lote/08-bulbos main
   ```

   Se a sessão já foi aberta numa worktree própria, só crie a branch nela. Trabalhe só dentro da worktree daqui em diante.
3. Rode `npm ci` na worktree.
4. Servidor de desenvolvimento: a configuração `dev` usa a porta 5173 fixa. Se ela estiver ocupada por outra leva, acrescente em `.claude/launch.json` uma entrada `dev-NN` na porta `51NN` (o número da leva) e **nunca commite essa mudança**: desfaça com `git restore .claude/launch.json` antes de cada commit.
5. Monte a lista de tarefas com as etapas abaixo.

## 2. Estudar a referência

1. Para cada item, abra os modelos parecidos em `C:\Users\kitsu\Documents\cook-soundtrack\models\extracted` e renderize na mesma luz com `art/blender/ref.py`. Veja também os quadros do vídeo de gameplay quando o item aparece nele.
2. Anote em `docs/inspiracao/` o que a referência faz melhor (cor, degradê, brilho, corte, enfeite). O que vier de vídeo ou quadro é inferência e fica marcado assim.
3. Nunca copie arquivo, malha ou textura de lá. Levamos gênero e sensação.

## 3. Ficha e medida de antes

1. Escreva a ficha curta de cada modelo, como manda a skill: o que é, tamanho, de que ângulo a câmera vê, materiais, orçamento de triângulos e textura (tabela "Orçamento" do pipeline). Desvio da ficha é defeito.
2. Se a leva troca procedurais que já estão no jogo, meça **antes de mexer** os planos de câmera que mostram esses itens: triângulos e chamadas de desenho num quadro, com sombra e pós-processamento, como descrito em `modelos-3d.md` (`art/scene.html?shot=<plano>`, `world.snapshot`, sorteio da feira fixado). Guarde os números.

## 4. Modelar no Blender

1. Um script por modelo em `art/blender/models/<nome>.py`, reaproveitando `art/blender/lib.py` e `art/blender/parts.py`. Peça que serve a outras levas vai para `parts.py`.
2. Gere com o Blender sem janela:

   ```bash
   "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P art/blender/build.py -- <modelo> <pasta-das-previas>
   ```

   A pasta das prévias fica no scratchpad da sessão, fora do repositório.
3. Olhe de verdade cada prévia (`<modelo>.png`, `<modelo>_high.png`, as fotos de cada peça) e confira o `<modelo>.json` contra o orçamento. Itere até ficar bom; não suba polígono que não aparece na tela.
4. Cada peça é escrita no referencial do procedural que ela troca, e o nó do `.glb` leva o nome que o jogo vai procurar.

## 5. Comparar e aprovar

1. Monte a comparação lado a lado de cada item: referência, modelo atual do jogo (`/art/compare-current.html?item=<item>`, quando existe) e modelo novo. Item novo, que ainda não existe no jogo, compara só referência e novo.
2. Mostre ao usuário numa imagem ou página só, com os números (triângulos, textura, KB).
3. **Sem `direto`:** espere a aprovação. Ajuste o que ele pedir e mostre de novo. **Com `direto`:** siga, mas mostre a comparação no relatório final.
4. Se o modelo atual for melhor que o novo (lição 7 do pipeline), diga isso em vez de trocar.

## 6. Trocar no jogo

Siga "Troca no jogo" de `modelos-3d.md`. Em resumo:

1. O procedural sai do caminho do jogo e vai para `src/three/archive/` (arquivado, nunca apagado), no arquivo do mesmo tipo (`procedural.js`, `sets.js`, `station.js`) ou num novo. Textura que só ele usava vai junto.
2. O `.glb` entra em `public/models/` e o nome na lista `MODELS` de `src/three/models.js`. Use `model()`, `part()` e `dish()`; carregue uma vez, divida geometria e material entre as cópias.
3. O que muda durante o minijogo continua em código. Guarde referências em `userData`, nunca dependa da ordem dos filhos.
4. **Item novo sem receita jogável:** o script e o `.glb` entram no repositório, mas o nome **não** entra em `MODELS`, para o jogo não baixar o que não usa. Anote na leva que ele está pronto e fora do jogo, esperando a receita.
5. Aproveite para deixar o jogo mais leve: reaproveitar geometria e material, tirar código que ficou sem uso.

## 7. Conferir, medir e polir

1. `npm test` e `npm run build` passam.
2. Abra o jogo pelo servidor de desenvolvimento (`?speed=4` acelera) e jogue as receitas que usam os itens da leva, passando por feira, bancada e prato pronto. Leia o console: nenhum erro novo.
3. Tire a foto de cada plano de câmera afetado e olhe no jogo, não só no estúdio (lição 12 de `modelos-3d.md`): cor, escala, posição, sombra, brilho de metal e vidro.
4. Meça o depois com o mesmo método do antes. Se piorou sem motivo, descubra o culpado escondendo um nó de cada vez e conserte.
5. Polir: corrija o que ficou estranho no jogo, gere de novo, confira de novo. Repita até ficar no nível das levas anteriores.

## 8. Documentar

1. `modelos-3d.md`: a seção da leva (o que entrou, tabela de triângulos e KB, como ficou a troca, tabela de antes e depois) e as lições novas da troca e de desempenho, no fim da lista.
2. `pipeline-blender.md`: as lições novas de modelagem, no fim da lista. Toda lição nasce de um erro de verdade, uma frase de regra e uma de porquê.
3. `lotes-modelos.md`: marque a leva como feita (data e o que ficou fora do jogo). `inventario-modelos.md`: mova os itens para "Já no Blender".
4. Escreva para quem lê: português simples, frases completas, sem jargão sem explicação.

## 9. Commitar

Commits pequenos e atômicos, em Conventional Commits, cada um compilando e passando nos testes. Separe, no mínimo:

1. `feat(blender): ...` para mudanças em `lib.py`, `parts.py` ou `build.py`.
2. `feat(models): add blender <tema> (batch NN)` com os scripts e os `.glb`.
3. `feat(game): swap <tema> to blender models` com a troca, o arquivamento e as medidas no código.
4. `docs(cozinha): log batch NN, numbers and lessons`.

Adicione os arquivos pelo nome, nunca `git add -A`, e revise o diff antes de cada commit. Não commite prévias, `.blend`, nem a mudança de porta do `launch.json`.

## 10. Mergear na main

Outras levas podem ter entrado na main enquanto você trabalhava.

1. Na worktree: `git rebase main`.
2. Conflitos prováveis e como resolver:
   - lista `MODELS` em `models.js`: manter os nomes das duas levas;
   - lições numeradas em `pipeline-blender.md` e `modelos-3d.md`: manter as duas, as suas depois, e renumerar as suas para seguir a sequência;
   - `lotes-modelos.md` e `inventario-modelos.md`: manter as marcações das duas levas.
3. Depois do rebase, `npm test` e `npm run build` de novo, e uma conferida rápida no jogo se outra leva mexeu nos mesmos arquivos de cena.
4. Avance a main pela pasta principal, só se ela estiver limpa e na main:

   ```bash
   git -C C:/Users/kitsu/Documents/roberta/coozinhe-comigo merge --ff-only lote/NN-tema
   ```

   Se a main andou de novo nesse meio tempo, volte ao passo 1. Se a pasta principal tiver mudança não commitada, pare e avise; nunca mexa nela.
5. Se o repositório tiver remoto, faça push da main. Hoje ele não tem.
6. Remova a worktree e a branch: `git worktree remove ../coozinhe-comigo-lote-NN` e `git branch -d lote/NN-tema`.

Nada disso toca produção. Se alguma etapa pedir deploy ou algo fora do repositório, pare e pergunte.

## 11. Relatório final

Curto, em português simples: o que entrou no jogo, o que ficou fora e por quê, a comparação lado a lado, os números de antes e depois, as lições novas e o que não foi verificado.
