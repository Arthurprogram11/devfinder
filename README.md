# DevFinder

Aplicação web responsiva para pesquisar perfis públicos do GitHub e salvar desenvolvedores favoritos no navegador.

## Funcionalidades

- Pesquisa de usuários pela GitHub REST API;
- exibição de avatar, nome, username, bio e localização;
- exibição de seguidores, seguindo e repositórios públicos;
- tratamento de campo vazio, usuário inexistente e falhas da API;
- estados de carregamento, sucesso e erro;
- adição e remoção de favoritos;
- persistência dos favoritos com LocalStorage;
- interface responsiva para desktop e celular;
- cuidados básicos de acessibilidade.

## Tecnologias

- HTML5;
- CSS3;
- JavaScript;
- GitHub REST API;
- LocalStorage.

## Conceitos praticados

- HTML semântico;
- DOM e eventos;
- requisições HTTP com `fetch`;
- Promises e `async/await`;
- JSON;
- tratamento de erros com `try/catch`;
- manipulação de estados da interface;
- persistência local;
- responsividade.

## Como executar

1. Clone este repositório.
2. Abra a pasta do projeto.
3. Abra o arquivo `index.html` no navegador.

Não é necessário instalar dependências.

## Estrutura

```text
devfinder/
├── css/
│   └── style.css
├── js/
│   └── script.js
├── index.html
└── README.md
```

## Melhorias futuras

- Listar repositórios recentes do usuário;
- adicionar filtros e ordenação;
- implementar tema claro;
- criar testes automatizados.

## Autor

Desenvolvido por [Arthur de Lima](https://github.com/Arthurprogram11).
