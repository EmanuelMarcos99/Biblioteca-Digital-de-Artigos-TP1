# [Biblioteca Digital de Artigos TP1]


## 👨‍💻 Membros da Equipe

| Nome | Papel |
| :--- | :--- |
| Emanuel Figueiredo | Full-stack | 
| Ezequiel Moreira | Full-stack | 

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

* **Linguagem:** JavaScript
* **Frontend:**
    * React.js
* **Backend:**
    * Node.js
* **Banco de Dados:**
    * PostgreSQL

---

## 🤖 Ferramenta de IA

* **GitHub Copilot**

---

 ## Backlog da Sprint

    [✅] História 1: CRUD de Eventos

        Como administrador, posso cadastrar, editar e apagar um evento principal.

        Tasks:

            Back-end: API com rotas REST para o CRUD completo de eventos.

            Front-end: Interface para listar, criar, editar e excluir eventos.

    [✅] História 2: CRUD de Edições de Evento

        Como administrador, posso gerir as edições de um evento.

        Tasks:

            Back-end: API com rotas REST para o CRUD de edições de eventos.

            Front-end: Interface para gerenciar as edições vinculadas a um evento.

    [✅] História 3: CRUD de Artigos com Upload

        Como administrador, posso cadastrar um artigo manualmente, incluindo o upload do ficheiro PDF.

        Tasks:

            Back-end: API para o CRUD de artigos, incluindo a lógica de upload de arquivos.

            Front-end: Formulário para cadastro de artigos com funcionalidade de upload de PDF.

    [✅] História 4: Importação em Massa via BibTeX

        Como administrador, posso importar múltiplos artigos de uma só vez a partir de um ficheiro .bib.

        Tasks:

            Back-end: API com parser de BibTeX para criação de artigos em lote.

            Front-end: Interface para upload de arquivo .bib para importação em massa.

    [✅] História 5: Pesquisa Avançada de Artigos

        Como utilizador, posso pesquisar artigos por título, autor e nome do evento.

        Tasks:

            Back-end: Rota de API para filtrar artigos por múltiplos critérios.

            Front-end: Componente de busca com autocomplete e destaque de resultados.

    [✅] História 6: Páginas Públicas de Eventos e Edições

        Como utilizador, posso navegar para uma página de um evento e para a página de uma edição.

        Tasks:

            Back-end: Rotas de API públicas para servir dados agregados de eventos e edições.

            Front-end: Páginas dinâmicas para visualização de eventos e suas edições.

    [✅] História 7: Página Pública de Autor

        Como utilizador, posso ver uma página com todos os artigos de um autor específico.

        Tasks:

            Back-end: Rota de API pública para buscar e agrupar artigos por autor.

            Front-end: Página dinâmica para exibir os artigos de um autor específico.

    [✅] História 8: Notificação por Email

        Como utilizador, posso inscrever-me para receber notificações sobre novos artigos.

        Tasks:

            Back-end: Rota de API para registro de subscrições e lógica de envio de email.

            Front-end: Formulário para subscrição de notificações por email.


---

## Diagramas UML
## Diagrama de Pacotes (Arquitetura do Sistema)

Este diagrama mostra a organização de alto nível do projeto, separando as responsabilidades entre o cliente (Frontend), o servidor (Backend) e os serviços externos.
 
## Arquitetura do Sistema

## Diagrama de Pacotes

Aqui está a visão geral da arquitetura do sistema:

```mermaid
graph TD
    A[Frontend] --> B[API Service]
    B --> C[API Routes]
    C --> D[Controllers]
    D --> E[Supabase Client]
    E --> F[Supabase DB]
    E --> G[Supabase Storage]
    E --> H[Supabase Auth]


    style A fill:#cde4ff,stroke:#99b8e2,stroke-width:2px
    style B fill:#cde4ff,stroke:#99b8e2,stroke-width:2px
    style C fill:#d5f2d2,stroke:#a6c9a2,stroke-width:2px
    style D fill:#d5f2d2,stroke:#a6c9a2,stroke-width:2px
    style E fill:#ffe0b3,stroke:#e6c499,stroke-width:2px
    style F fill:#ffe0b3,stroke:#e6c499,stroke-width:2px
    style G fill:#ffe0b3,stroke:#e6c499,stroke-width:2px
    style H fill:#ffe0b3,stroke:#e6c499,stroke-width:2px
    
##  Diagrama de Sequência (Cadastro de Novo Artigo)

Este diagrama mostra o fluxo de execução passo a passo para uma das tarefas mais importantes do sistema: o cadastro de um novo artigo por um administrador, incluindo o upload do ficheiro PDF.

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant ReactApp as Frontend (React)
    participant Server as Backend (Node.js)
    participant Supabase as Supabase (BaaS)

    Admin->>+ReactApp: Preenche o formulário e seleciona o PDF
    ReactApp->>+Server: POST /api/articles/import-pdf (com dados e ficheiro)
    Server->>+Supabase: Upload do ficheiro PDF para o Storage
    Supabase-->>-Server: Retorna o URL público do PDF
    Server->>+Supabase: INSERT na tabela 'articles' (com o URL do PDF)
    Supabase-->>-Server: Retorna os dados do artigo criado
    Server-->>-ReactApp: Resposta 201 (Created) com os dados do artigo
    ReactApp-->>-Admin: Exibe mensagem de sucesso e atualiza a lista
