# Feira (fase 1: compras)

Referência visual da banca de feira livre usada no minijogo de compras (`src/three/games/shop.js`, banca em `src/three/sets.js`).

A busca na web (nov/2026) não trouxe material específico sobre como se monta uma banca; o que segue é observação comum de feira livre brasileira, marcada como inferência.

## O que faz uma banca parecer de feira (inferência)

- Caixotes de madeira em degraus, inclinados para o freguês, para mostrar o que tem dentro.
- Mercadoria amontoada: vários do mesmo item por caixote, nunca um só. Frascos e caixas ficam em fila.
- Plaquinha de preço escrita à mão em cada caixote.
- Toldo listrado, varal de lâmpadas e bandeirinhas coloridas balançando.
- Outras barracas ao fundo.

## Como isso virou jogo

- Caixotes inclinados (0,3 rad) com a frente baixa: nada some atrás da borda, como acontecia com a câmera rasa.
- Um montinho por caixote (cinco amontoados, ou três em fila para frascos e caixas).
- A banca se monta para o tamanho da lista: o número de caixotes por degrau e a largura deles saem da quantidade de itens.
- Sem plaquinhas de preço e sem balanço dos itens: a banca fica mais limpa de ler.
- Ao acertar, só um item do monte vai para a cesta; o resto do caixote fica cinza, marcando o que já foi comprado.
- Sem placa com o nome da feira na frente do balcão.
