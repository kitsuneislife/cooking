---
name: ilustracao-svg
description: Desenhar ingredientes, pratos, estações e utensílios do Cozinhe Comigo em SVG detalhado (volume, brilho, textura) com animação leve. Use ao criar ou corrigir qualquer ilustração do jogo.
---

# Ilustração SVG – Cozinhe Comigo

Como desenhar as ilustrações do jogo com qualidade constante. A referência viva é [exemplo.html](exemplo.html): camarão, abacaxi, shiitake e alho, com prato, sombra e animação.

## Regra principal: nunca desenhar às cegas

Todo desenho passa por pelo menos duas rodadas de "renderizar, olhar, criticar, corrigir":

1. Servir a pasta por HTTP (o navegador do app não abre `file://`):
   `python -m http.server 5781 --bind 127.0.0.1` (rodar em segundo plano).
2. Abrir `http://127.0.0.1:5781/<arquivo>.html` no navegador do app e tirar screenshot.
3. Deixar cada ilustração grande na tela (cards de 340 px) para enxergar o detalhe.
4. Escrever a crítica antes de mexer: o que não parece o ingrediente real e por quê.
5. Corrigir e renderizar de novo. Só mostrar ao usuário depois disso.

## Antes de desenhar: anatomia

Listar de 4 a 6 traços que fazem o ingrediente ser reconhecido. Desenhar esses traços primeiro; o resto é acabamento.

| Ingrediente | Traços que não podem faltar |
|---|---|
| Camarão | corpo em C segmentado, rabo em leque abrindo para fora, cabeça com espinho, olho, antenas longas, patinhas na barriga |
| Abacaxi | corpo oval, escamas em losango com "olhinho" escuro, coroa de folhas em duas camadas |
| Shiitake | chapéu marrom-escuro com rachaduras claras em rede, borda clara curvada, lamelas por baixo, pé fibroso |
| Alho | bulbo redondo e gordo, gomos marcados por sulcos, estrias roxas, pescoço de casca seca, raízes na base |

## Estilo fixo (vale para todas as ilustrações)

- **Luz:** sempre vindo de cima e da esquerda. Brilho no alto à esquerda, sombra embaixo à direita.
- **Contorno:** um tom mais escuro da própria cor, com opacidade de 0,4 a 0,7. Nunca preto.
- **Volume:** gradiente radial ou linear em todo corpo grande, com três ou quatro paradas de cor.
- **Brilho:** traço branco curto (`stroke` branco, opacidade de 0,5 a 0,8, `stroke-linecap="round"`) seguindo a curva da forma.
- **Textura:** filtro `#grain` (ruído multiplicado, bem claro) aplicado ao grupo da comida.
- **Base:** todo ingrediente fica sobre o prato padrão (`plate()`), com sombra desfocada que acompanha a animação.
- **Paleta da interface:** pergaminho `#e9dfcc`, tinta `#4a3b2a`, moldura `#b9a684`; fonte Fredoka.

## Técnicas que funcionaram

- **Detalhe repetitivo por código.** Segmentos, escamas, rachaduras, estrias e raízes são gerados com laços em JavaScript. Fica rico sem desenhar cada traço à mão.
- **Aleatório com semente** (`seed` + `rand()`). O desenho sai igual em toda execução.
- **Gradiente em `userSpaceOnUse`** para formas em anel (camarão). Assim a barriga fica clara e as costas escuras em todos os segmentos.
- **`clipPath` com o formato do corpo** para a textura (escamas, rachaduras) nunca vazar para fora.
- **Sulco = par de linhas:** uma escura e, logo ao lado, uma branca. Dá a impressão de dobra (gomos do alho).
- **Sobreposição de trás para a frente:** peças do fundo primeiro e mais escuras; peças da frente depois e mais claras.

## Erros que já cometemos

| Erro | Por que ficou ruim | Correção |
|---|---|---|
| Rachaduras do shiitake saindo todas de um ponto | Parecia fogos de artifício | Linhas quebradas curtas com direção aleatória, mais densas perto da borda |
| Gomos do alho separados e pontudos | Parecia uma flor de lótus | Um bulbo redondo único com sulcos desenhados por cima |
| Rabo do camarão seguindo a curva para dentro | Parecia uma luva por cima do corpo | Leque com quatro nadadeiras apontando para fora e para baixo |
| Botão sem `font: inherit` | O nome do card saiu com a fonte padrão | `font: inherit; color: inherit;` em todo `button` |

## Animação

- **Parado:** flutua de 4 px em 3,2 s; a sombra encolhe junto. Atrasos diferentes por card para não ficarem sincronizados.
- **Passar o mouse ou focar:** o card sobe 6 px e gira −1,5°, com curva de mola `cubic-bezier(.34,1.56,.64,1)`.
- **Clique:** "pop" que achata, estica e volta (0,5 s).
- **`prefers-reduced-motion: reduce`:** desliga todas as animações.
- **Foco visível:** a borda do card muda de cor no `:focus-visible`.

## Estrutura de cada desenho

```js
function ingrediente(svg) {
  const g = el(plate(svg), "g");   // prato + grupo animado .food
  // 1. silhueta e cor de base (gradiente)
  // 2. detalhe repetitivo por código, dentro de clipPath
  // 3. sombreamento (sobreposição com gradiente)
  // 4. contorno e brilhos
  g.style.filter = "url(#grain) drop-shadow(0 2px 2px #3a241055)";
}
```

`viewBox="0 0 200 180"`; o centro do prato fica em (100, 146) e a comida ocupa mais ou menos de y=25 a y=145.

## Checklist antes de mostrar

- [ ] Reconhecível em tamanho pequeno (64 px), não só grande.
- [ ] Todos os traços da anatomia aparecem.
- [ ] Luz vindo do alto à esquerda, como nos outros desenhos.
- [ ] Nada vaza do formato (textura dentro do `clipPath`).
- [ ] Pelo menos duas rodadas de screenshot e correção.
- [ ] Animação suave e desligada com `prefers-reduced-motion`.
- [ ] Card com `aria-label`, focável e usável pelo teclado.
