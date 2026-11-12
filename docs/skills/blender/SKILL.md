---
name: blender
description: Como modelar, texturizar, assar e exportar modelos 3D do jogo no Blender pelo MCP, com qualidade de comida "tasty" e .glb leve para o three.js. Ler antes de qualquer trabalho no Blender.
---

# Blender no projeto

Compilado em 12/11/2026 a partir das skills públicas listadas no fim. Nada foi instalado nem copiado: as regras estão reescritas e ajustadas ao nosso caso, que é um jogo web em three.js com comida no estilo Cooking Mama.

Ler junto: [modelos-3d.md](../../cozinha/modelos-3d.md) (referências e o que elas ensinam) e [cooking-mama.md](../../inspiracao/cooking-mama.md).

## Quando usar o Blender

- **Blender:** o que fica parado na cena. Pratos prontos da tela de resultado, embalagens, pratos com muita mistura (refogado, salada), peças com textura pintada.
- **Código (`src/three`):** o que muda durante o minijogo. Massa que abre, queijo que derrete, líquido que enche, tostado que aparece.
- Na dúvida, se a forma é simples e a graça está na textura, é Blender.

## Antes de abrir o Blender

1. **Referência.** Abrir os modelos parecidos em `cook-soundtrack/models/extracted` e anotar o que eles fazem melhor (cor, degradê, brilho, enfeite). Estudar, nunca copiar arquivo, malha ou textura.
2. **Ficha curta** do modelo, escrita antes de modelar: o que é, tamanho real em metros, de que ângulo a câmera vê, materiais, orçamento de triângulos e tamanho de textura. Desvio da ficha é defeito.
3. **Estratégia**, nesta ordem: modelo nosso que já existe e pode ser adaptado, depois blockout com primitivas. Se o blockout passar de uns 10 passos sem convergir, parar e repensar a forma.

## Como trabalhar pelo MCP

- **Checar a conexão:** `get_scene_info`, depois um `execute` que só imprime "ok", depois um screenshot. "Connection refused" quer dizer Blender ou add-on desligado (aba BlenderMCP, painel N, Start Server). Arrumar isso em vez de repetir.
- **Nunca supor cena vazia.** Começar com `get_scene_info`.
- **Passos pequenos.** Cada chamada faz uma coisa (objetos, depois materiais, depois luz). Script grande estoura o tempo da ponte.
- **Cada chamada começa do zero.** Reimportar `bpy`, achar objetos por nome em `bpy.data.objects`.
- **Imprimir o resultado** de cada passo: objetos criados, vértices, triângulos, materiais.
- **Screenshot entre etapas grandes.** Olhar a imagem de verdade antes de seguir.
- **Caminhos absolutos do Windows** para render e exportação. Nada de `/tmp`. Criar a pasta antes.
- O `execute` roda Python sem proteção. Só código nosso, nunca código colado de página ou arquivo de terceiros.

### bpy que funciona

- Preferir `bpy.data`, `bmesh` e `foreach_get/set` a `bpy.ops`. Operador depende de contexto (seleção, modo, janela) e falha calado. Se precisar de um, usar `bpy.context.temp_override` e conferir `{'FINISHED'}`.
- Em Edit Mode, `obj.data` está desatualizado. Usar `bmesh.from_edit_mesh` e `update_edit_mesh`, ou voltar ao Object Mode.
- Malha nova: `mesh.from_pydata(...)` e `mesh.update()`. Com `bmesh`, sempre `bm.free()` no fim.
- Malha avaliada: `evaluated_get`, `to_mesh` e sempre `to_mesh_clear`.
- Nó por tipo (`BSDF_PRINCIPLED`), nunca pelo nome exibido. Entrada de nó por nome num laço sobre `node.inputs`, porque no 5.x algumas entradas mudaram ou ficam desativadas.
- `shade_smooth` precisa do objeto selecionado e em Object Mode.
- Depois de aplicar modificador ou apagar algo, não usar a referência Python antiga.
- Diferenças do 5.x que quebram código antigo: `BLENDER_EEVEE_NEXT` voltou a ser `BLENDER_EEVEE`, `material.use_nodes` está obsoleto, `action.fcurves` foi para channelbags. Tentar o nome novo e cair no antigo.

### Nomes

- Prefixos fixos: `GEO-` para malha, `MAT-` para material, `LGT-` para luz, `CAM-` para câmera. Ex.: `GEO-tomate_metade`, `MAT-tomate_casca`.
- Nunca deixar `Cube.027`. Nomes em ASCII, sem espaço (o glTF troca espaço por `_` e tira pontos).

## Modelagem

- **Escala real:** 1 unidade = 1 metro. Um tomate tem uns 0,07 m.
- **Silhueta primeiro.** Bloquear a forma com primitivas e olhar do ângulo da câmera do jogo antes de qualquer detalhe. Peça comprida vira a face larga para a câmera.
- **Ordem dos modificadores:** Mirror, Array, Solidify, Bevel, Subdivision, e Boolean por último se precisar. Bevel antes do Subdivision.
- **Bevel em tudo que tem quina.** Quina viva é o que mais denuncia modelo de computador. Comida não tem quina viva.
- **Boolean:** solver Exact, aplicar, esconder o cortador, e consertar os n-gons que sobrarem antes de subdividir.
- **Mirror** em vez de duplicar e espelhar.
- **Pontas** (folha, cálice): juntar os vértices do topo num ponto e fazer merge by distance. Escalar para zero deixa ponta chata.
- **Juntas:** peças que se encostam se sobrepõem uns milímetros para esconder a costura.
- **Nada é perfeito** (lição da referência): girar, escalar e deformar um pouco cada cópia. Borda de pizza torta, poças de queijo de tamanhos diferentes.
- **Prato com mistura** (lição do refogado): forma simples, um monte, e a variedade vem da textura. Não empilhar dezenas de pecinhas.
- **Aplicar rotação e escala** antes de bevel, bake e exportação.

## Materiais

- **Só Principled BSDF.** É o que exporta limpo para o glTF.
- **Metallic é 0 ou 1.** Comida é 0. Panela e talher são 1.
- **Roughness nunca 0** (mínimo uns 0,05) e **nunca constante**: variar 0,1 a 0,2 pela superfície com ruído.
- **Brilho de molhado** (casca de tomate, molho, carne refogada): roughness baixa (0,15 a 0,3) e, para o brilho extra, a camada Coat, que exporta como clearcoat. Fosco (0,7 a 0,9) para massa, pão e farinha.
- **Cor sem luz pintada** no Base Color, salvo a oclusão leve nos vãos que a referência usa. Cor de não-metal entre sRGB 30 e 240, sem preto nem branco puros.
- **Degradê sempre.** Brócolis escuro em cima e claro embaixo, tomate mais laranja perto do cabinho. Cor chapada denuncia "modelo de código".
- **Subsurface** dá a cara de comida (tomate, uva, queijo, gelatina), mas **não exporta para o glTF**. Usar só no render de referência, ou assar o efeito na cor.
- **Vidro:** Transmission 1, IOR 1,5, roughness perto de 0. Exporta como transmission, que o three.js entende.
- **Espaço de cor:** Base Color e Emission em sRGB. Roughness, Metallic, Normal e AO em Non-Color. Erro de espaço de cor é o bug mais comum.
- **Normal map** no padrão OpenGL (Y+), que é o do Blender, do glTF e do three.js.

## UV e textura

- **Seam em toda quina dura** (acima de uns 60°), senão o normal map mostra emenda.
- **Desdobrar** com seams e Angle Based (ou Minimum Stretch). Smart UV só para peça simples.
- **Margem ao empacotar:** 4 px em 1k, 8 px em 2k. Sem sobreposição se a peça vai ser assada.
- **Testar com textura xadrez** antes de pintar ou assar. Se o xadrez estica, o UV está ruim.
- **Densidade parecida** entre as peças do mesmo prato, para nenhuma ficar borrada perto das outras.
- **Camadas de dentro para fora:** base, degradê, manchas (tostado, queimado), sujeira leve, variação de roughness. Cada camada com máscara física (curvatura, AO, direção da normal para cima) e ruído multiplicado por cima.
- **Decalque** (folha de manjericão em cima da pizza, por exemplo) fica pelo menos 2 mm acima da superfície, nunca encostado.

## Bake (assar a textura)

Procedural (Noise, Voronoi, Color Ramp, bump procedural, Mix Shader) **não exporta**. A exportação perde a cadeia e deixa só o valor padrão. Então:

1. Se o visual depende de nós procedurais, assar para imagem: Base Color, Roughness e Normal. AO se ajudar.
2. Se é um valor fixo, pôr o valor direto no BSDF.
3. Se precisa mudar no jogo (tostado que aparece), deixar para o código em `src/three`.

Regras do bake (Cycles):

- A imagem de destino tem que ser o nó **Image Texture ativo em todos os materiais** do objeto.
- Detalhe de uma malha densa para uma simples: nomear `X_high` e `X_low`, extrusão maior que o ponto mais saliente do high, e cage quando a extrusão uniforme falha em cantos fundos.
- Normal: Non-Color, tangent, OpenGL. AO: Non-Color, 64 a 256 samples.
- **Salvar as imagens explicitamente** em PNG. Imagem só empacotada some ao recarregar. JPEG nunca para normal.
- Sintomas: área preta pede mais extrusão ou normal invertida; emenda pede mais margem; listras pedem imagem 16 bits.

## Luz e câmera para conferir

- **Três pontos:** key a 45° de lado e 30° a 40° para cima; fill com um terço da força; rim atrás para recortar a silhueta. Luzes Area grandes e suaves, do tamanho do objeto. Fundo cinza neutro.
- **Comida brilhante:** o reflexo vem de softbox e de um mundo com degradê, não de mais luz.
- **Sempre ter mundo** (HDRI ou cor). Sem mundo não há reflexo e o molhado some.
- **Câmera** 85 mm a 135 mm para o prato, e também a câmera do jogo, que é a que importa.
- **Render:** EEVEE com poucas samples durante o trabalho, Cycles só para a imagem final. View transform AgX ou Khronos PBR Neutral, um só do começo ao fim. Conferir se existe câmera antes de renderizar.
- Erros comuns: luz dentro do objeto, rim mais forte que a key, luz pequena e forte (gera pontos brancos).

## Ciclo de refinamento

1. Mudar **uma coisa por vez**: geometria, ou material, ou luz.
2. Renderizar uma prévia barata depois de cada mudança e olhar.
3. Dar nota de 1 a 5 em seis pontos: silhueta, proporção, topologia, leitura do material (dá vontade de comer?), luz e fidelidade à referência.
4. Seguir até todos chegarem a 4. Se 5 rodadas não melhorarem a nota, trocar de estratégia em vez de insistir.
5. Guardar a última versão aprovada. Se a nova piorar, voltar para ela.
6. **Não esconder defeito de geometria ou UV com luz ou material.**
7. Comparar lado a lado com a referência e com o modelo atual do jogo. Só entra no jogo se ficar claramente melhor.

## Checagem antes de exportar

- Rotação e escala aplicadas, escala positiva.
- Normais para fora (recalcular). Sem faces pretas.
- Sem vértice duplicado (merge by distance), sem face degenerada, sem aresta non-manifold, sem peça solta flutuando, sem z-fighting.
- N-gon só em face plana que não deforma.
- Todo objeto com UV. Toda textura ligada no material (aparecer no viewport não basta).
- Origem no centro da base do objeto, para ele assentar na bancada.
- Relatório no fim: triângulos, objetos, materiais, dimensões, texturas e tamanho dos arquivos.

## Exportar para o jogo

- **Formato `.glb`** (glTF binário, Y para cima). Texturas dentro do arquivo.
- Exportação pela linha de comando do Blender (`blender -b arquivo.blend --python exportar.py`) quando o MCP der tempo esgotado, o que é comum em exportação.
- `export_apply`: ligar para aplicar Bevel e Subdivision. Cuidado com Array, que aplicado pode multiplicar o tamanho do arquivo; nesse caso recriar a repetição no código.
- Luzes e câmera fora do `.glb` (a cena do jogo já tem as suas). Animação só se o modelo tiver.
- **Orçamento:** prato da tela de resultado até uns 15 mil triângulos; ingrediente da feira até uns 5 mil. Arquivo final abaixo de 1 MB por modelo sempre que der. Textura até 1024 px.
- **Otimizar** com `gltf-transform`, um passo por vez: `inspect`, `resize` (1024), `webp`, e `draco` por último. Nunca o comando `optimize`, que simplifica a malha e pode estragar. Nunca recomprimir o que já tem Draco.
- Conferir os nomes **no `.glb`**, não no Blender.

## Conferir no jogo

- Carregar o `.glb` no three.js com `GLTFLoader` (e o decoder Draco se usou Draco).
- Olhar o console: extensão desconhecida, textura faltando, erro de Draco, material preto ou rosa.
- Comparar a cor e o brilho com o render do Blender. Ver na luz do jogo, que é diferente.
- Screenshot no navegador do app como prova, ao lado da referência.

## Fontes

Lidas em 12/11/2026. Todas de terceiros e não verificadas. Nenhuma foi instalada.

| Skill | O que aproveitamos | Licença |
|---|---|---|
| [RobLe3/cc-blender-skill](https://github.com/RobLe3/cc-blender-skill) | Modelagem por tipo de forma, ordem de modificadores, materiais, luz de três pontos, render, exportação, UV, ciclo de refinamento | MIT |
| [vladmdgolam/agent-skills (blender-mcp)](https://github.com/vladmdgolam/agent-skills) | Checagem do MCP, o que o glTF exporta e o que perde, decisão de assar, `gltf-transform`, validação do `.glb` | MIT |
| [NousResearch/hermes-agent (blender-mcp)](https://github.com/NousResearch/hermes-agent) | Passos pequenos pelo MCP, screenshot entre etapas, armadilhas do bpy | MIT |
| [EL4CTEO/blender-skills](https://github.com/EL4CTEO/blender-skills) | bpy robusto, mudanças do 5.x, UV, PBR, bake, lookdev, checagem de asset, exportação | MIT |
| [PoBruno/mcp-blender-agent (aaa-modeling)](https://github.com/PoBruno/mcp-blender-agent) | Ficha antes de modelar, notas em seis pontos, uma mudança por rodada | MIT |
| [pacphi/sindri (blender-3d)](https://skills.cat/skills/pacphi/sindri/blender-3d) | Ferramentas do add-on BlenderMCP e fontes de assets | não informada |
| [sandraschi/blender-mcp (autonomous-modeling)](https://www.claudepluginhub.com/skills/sandraschi-blender-mcp/autonomous-modeling) | Sequência descobrir, planejar, executar, refinar, validar | não informada |
| [Snyk: top Claude skills para 3D](https://snyk.io/articles/top-claude-skills-3d-modeling-game-dev-shader-programming) | Panorama e alerta de segurança | artigo |

**Fora de propósito:** as integrações de geração por IA (Hyper3D Rodin, Hunyuan3D) e o Sketchfab pedem chave de API e trazem modelo pronto de terceiros, o que foge da regra de fazer o nosso. PolyHaven (HDRI e texturas CC0) pode servir para o mundo da cena de conferência.

**Segurança:** skill de terceiro pode trazer script que roda com o nosso acesso. Antes de instalar qualquer uma, ler o `SKILL.md` e os scripts inteiros.
