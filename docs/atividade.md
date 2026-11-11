# Avaliação Final – Segundo Bimestre

Fonte: [Blackboard Senac – SEGUNDO BIMESTRE - Avaliação Final](https://senac.blackboard.com/webapps/assignment/uploadAssignment?content_id=_16022183_1&course_id=_269626_1&group_id=&mode=view)

## Nosso grupo

- **Integrantes:** Joaquim e Luana (dupla)
- **Recurso escolhido:** Receitas – https://dummyjson.com/docs/recipes
- **Ideia do projeto:** jogo de cozinha interativo. Detalhes em [ideia.md](ideia.md).

## Enunciado

Projeto em dupla. Desenvolver uma aplicação Web de página única (SPA) com React que consuma uma API REST pública, aplicando navegação, componentes, gerenciamento de estado, formulários, organização do código e boas práticas de qualidade de interface. O foco é o Front-End: não é necessário implementar backend nem persistência de dados.

API: DummyJSON – https://dummyjson.com/docs

Recursos disponíveis (a dupla escolhe um):

1. Produtos – https://dummyjson.com/docs/products
2. Receitas – https://dummyjson.com/docs/recipes
3. Usuários – https://dummyjson.com/docs/users
4. Publicações – https://dummyjson.com/docs/posts
5. Carrinhos – https://dummyjson.com/docs/carts
6. Citações – https://dummyjson.com/docs/quotes

A identidade visual e a funcionalidade devem ser coerentes com o recurso escolhido. A dupla escolhe os endpoints adequados às funcionalidades. A interface deve ir além de exibir JSON bruto: precisa organizar as informações e permitir interação com o usuário.

## Requisitos obrigatórios

- [ ] **1. Navegação:** React Router com pelo menos duas rotas funcionais.
- [ ] **2. Consulta à API:** requisições GET com `fetch`, dados em lista, cards ou tabela; usar `useEffect` e `useState`.
- [ ] **3. Componentização:** componentes reutilizáveis, passando dados por props quando adequado.
- [ ] **4. Detalhamento ou filtro:** consulta de detalhes, busca, filtro ou outra interação útil compatível com o recurso.
- [ ] **5. Formulário e envio:** formulário controlado com validação básica e envio por POST ao endpoint apropriado.
- [ ] **6. Outra operação HTTP:** PUT/PATCH ou DELETE, quando o recurso oferecer, mostrando o resultado ao usuário.
- [ ] **7. Organização:** separar ao menos páginas, componentes e funções de acesso à API (pasta `services` ou equivalente).
- [ ] **8. Estados da interface:** mensagens de carregamento, sucesso e erro, inclusive quando a requisição falhar.
- [ ] **9. Qualidade de interface:** layout responsivo, HTML semântico, rótulos em formulários, navegação por teclado e feedback claro.

## Entrega

- [ ] Link do repositório Git com código-fonte, `package.json` e README.
- [ ] README com:
  - objetivo da aplicação;
  - recursos/endpoints utilizados;
  - instruções para instalar e executar (`npm install` e `npm run dev`);
  - integrantes;
  - observações sobre limitações da API.
- [ ] Demonstração da aplicação funcionando. Todos os integrantes serão arguidos sobre as decisões técnicas.
