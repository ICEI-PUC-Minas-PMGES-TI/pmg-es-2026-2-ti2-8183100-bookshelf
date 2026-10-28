# BookMark

O **BookMark** é uma aplicação web desenvolvida para incentivar o hábito da leitura. Com ela, os usuários podem explorar um catálogo de livros, organizar suas leituras, favoritar obras e acompanhar informações e atividades relacionadas à leitura.

## Funcionalidades

- Explorar e pesquisar livros no catálogo.
- Visualizar informações sobre as obras, como título, autor e outros dados disponíveis.
- Organizar livros nas listas **Lendo**, **Pretendo ler** e **Lidos**.
- Adicionar livros aos favoritos.
- Acessar o perfil do usuário.
- Consultar métricas de leitura.
- Visualizar publicações no feed social.

## Tecnologias utilizadas

- React
- JavaScript
- Vite
- React Router
- Node.js e Express (API)
- MongoDB (banco de dados da API)

## Integrantes da equipe

- Carolina Almeida Mendes de Souza
- Gabriel do Carmo Assis
- Giovanni Arenare Mota
- Lukas Nathan Matos Candeia

## Professores responsáveis

- Cleiton Silva Tavares
- Rafael Henriques Nogueira Diniz
- Rommel Vieira Carneiro

## Como executar

### Pré-requisitos

Instale o [Node.js](https://nodejs.org/). O npm é instalado junto com o Node.js.

### Passo a passo

1. Baixe ou clone este repositório.
2. Abra um terminal na pasta principal do projeto.
3. Entre na pasta do frontend:

   ```bash
   cd Codigo/Frontend
   ```

4. Instale as dependências:

   ```bash
   npm install
   ```

5. Inicie a aplicação:

   ```bash
   npm run dev
   ```

6. Abra no navegador o endereço local apresentado no terminal. Normalmente, o Vite utiliza `http://localhost:5173`.

O frontend já possui um endereço de API definido nos arquivos de ambiente do projeto. Portanto, para iniciar a interface, os comandos acima são suficientes.

## Observações
Essa aplicação depende da disponibilidade da Google Books API para funcionar.
Caso o catálogo não carregue os livros, clique no botão de tentar novamente algumas vezes ou dê F5.

## Estrutura de pastas

```text
BookMark/
├── Artefatos/
├── Documentacao/
├── Divulgacao/
└── Codigo/
    ├── Backend/
    └── Frontend/
        ├── public/
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   ├── services/
        │   └── mocks/
        ├── package.json
        └── vite.config.js
```


