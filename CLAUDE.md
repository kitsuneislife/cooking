# Cozinhe Comigo

Jogo de cozinha no navegador (React + Vite + three.js) no espírito de Cooking Mama: receitas da DummyJSON viram minijogos de gesto em 3D. A documentação de design fica em `docs/`.

## Antes de construir

- Mecânica ou visual novo: pesquisar a referência primeiro e anotar em `docs/inspiracao/` (o que vier de vídeo ou quadro é inferência e fica marcado assim).
- Levamos gênero e sensação, nunca a Mama, o nome, o logotipo, as falas, a música ou a arte.

## Modelos 3D: refactor visual progressivo

O visual 3D está sendo refeito aos poucos, uma leva de cada vez, com modelos mais bem-feitos, mais leves e com cara de comida gostosa ("tasty"). Ao pegar uma leva nova:

1. Ler [docs/cozinha/pipeline-blender.md](docs/cozinha/pipeline-blender.md): o pedido, o passo a passo, o orçamento e as lições. Não repetir os erros que estão lá.
2. Ver o progresso e o que falta em [docs/cozinha/modelos-3d.md](docs/cozinha/modelos-3d.md).
3. Estudar a referência em `C:\Users\kitsu\Documents\cook-soundtrack` (`models/extracted` e o vídeo de gameplay). É a régua de qualidade, mas nenhum arquivo, textura ou malha de lá entra no jogo.
4. Modelar pelos scripts de `art/blender/` (Blender 5.2 sem janela, `blender -b -P art/blender/build.py -- <modelo> <pasta>`). Desde o começo, pensar em desempenho: respeitar o orçamento de triângulos, textura e tamanho do `.glb` do pipeline, e nunca subir polígono que não aparece na tela.
5. Mostrar a comparação lado a lado (referência, modelo atual, modelo novo) e esperar o usuário aprovar.
6. **Depois de aprovado, trocar no jogo.** O modelo procedural sai do caminho do jogo e vai para `src/three/archive/` (arquivado, não apagado), e o jogo passa a carregar o `.glb` por `src/three/models.js`. Aproveitar cada troca para deixar o jogo mais leve: medir antes e depois (triângulos e chamadas de desenho), reaproveitar geometria e material, carregar o `.glb` uma vez só.
7. Anotar sempre: toda lição nova e todo erro consertado vão para o fim de `pipeline-blender.md` (modelagem) ou de `modelos-3d.md` (troca no jogo e desempenho), e o progresso em `modelos-3d.md`. O objetivo é cada leva sair melhor e mais rápida que a anterior.

O que fica parado na cena (ingrediente na feira, prato pronto) vem do Blender como `.glb` em `public/models/`. O que muda durante o minijogo (massa que abre, queijo que derrete, líquido que enche) continua em código, em `src/three/`.

## Comandos

- `npm run dev`: servidor de desenvolvimento (`?speed=4` acelera as animações).
- `npm test`: testes (`node --test`).
- `npm run build`: build de produção.
