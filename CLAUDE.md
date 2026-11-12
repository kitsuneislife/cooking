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
4. Modelar pelos scripts de `art/blender/` (Blender 5.2 sem janela, `blender -b -P art/blender/build.py -- <modelo> <pasta>`).
5. Mostrar a comparação lado a lado (referência, modelo atual, modelo novo) antes de levar qualquer coisa para o jogo.
6. Anotar no fim de `pipeline-blender.md` toda lição nova, e o progresso em `modelos-3d.md`.

O que fica parado na cena (ingrediente na feira, prato pronto) vem do Blender como `.glb` em `public/models/`. O que muda durante o minijogo (massa que abre, queijo que derrete, líquido que enche) continua em código, em `src/three/`.

## Comandos

- `npm run dev`: servidor de desenvolvimento (`?speed=4` acelera as animações).
- `npm test`: testes (`node --test`).
- `npm run build`: build de produção.
