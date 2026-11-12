# Skills do projeto

Instruções que o Claude segue ao trabalhar neste projeto.

| Skill | Para quê |
|---|---|
| [ilustracao-svg](ilustracao-svg/SKILL.md) | Desenhar as ilustrações do jogo em SVG, com o processo, o estilo e os erros já corrigidos. |
| [blender](blender/SKILL.md) | Modelar, texturizar, assar e exportar `.glb` no Blender pelo MCP. Compilada de 8 skills públicas (fontes no fim do arquivo). Ler antes de qualquer trabalho no Blender. |

Para o Claude Code carregar uma skill sozinho, ela precisa estar em `.claude/skills/<nome>/SKILL.md`. Aqui em `docs/skills` elas ficam como documentação; para usar, peça ao Claude para ler o arquivo antes de desenhar.

## Pesquisa de skills prontas (10/11/2026)

Procurei no catálogo de skills do Claude, no diretório de plugins da Anthropic e na web. Nenhuma skill pronta resolve ilustração detalhada no estilo do jogo. Por isso escrevemos a nossa.

| Skill | O que faz | Por que não usamos |
|---|---|---|
| [svg-art (kv0906/cc-skills)](https://github.com/kv0906/cc-skills/tree/main/skills/svg-art) | Scripts Python para padrões, fractais, gráficos e ícones de interface | Gera padrões geométricos, não ilustração. O repositório não declara licença. |
| [_svg-drawing (possumworx)](https://github.com/possumworx/claude-autonomy-platform/tree/main/.claude/skills/_svg-drawing) | Ciclo de renderizar o SVG em PNG, olhar e corrigir | A ideia é boa e entrou na nossa skill (com o navegador do app). Sem licença declarada, então não copiamos o texto. |
| [create-svg-illustrations (narumiruna/skills)](https://github.com/narumiruna/skills/tree/main/skills/optional/create-svg-illustrations) | Regras para diagramas SVG em slides e documentos | Focada em diagramas simples, com cores chapadas e sem filtros. É o oposto do visual que queremos. Licença MIT. |
| [svg-icon-generator (jeremylongshore)](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) | Ícones SVG | Avaliações públicas a consideram um esboço sem instruções concretas. |
| Plugin Icons8 (diretório da Anthropic) | Ícones e ilustrações prontos do Icons8 e animação para Lottie | Usa arte pronta do Icons8, não desenho próprio. Pode servir se mudarmos de ideia. |
| Plugin frontend-design (Anthropic) | Qualidade visual de interfaces | Não é sobre ilustração, mas pode ajudar no layout das telas. |
