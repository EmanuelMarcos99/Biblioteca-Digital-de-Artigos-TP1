# 🧪 TESTES E2E - CYPRESS

## 📦 Instalação

Execute os comandos abaixo no diretório `client/`:

```bash
# Instalar Cypress e dependências
npm install --save-dev cypress @testing-library/cypress start-server-and-test

# (Opcional) Para TypeScript
npm install --save-dev @types/node
```

## 🚀 Executando os Testes

### Modo Interativo (Recomendado para desenvolvimento)
```bash
npm run cypress
```

### Modo Headless (CI/CD)
```bash
npm run cypress:headless
```

### Executar E2E com servidor (start + test)
```bash
# Inicia o servidor React e executa testes
npm run e2e

# Versão headless
npm run e2e:headless
```

## 📁 Estrutura de Arquivos

```
client/
├── cypress/
│   ├── e2e/
│   │   └── biblioteca-digital.cy.js    # ← TESTES PRINCIPAIS
│   ├── fixtures/
│   │   ├── articles.json               # Dados mockados de artigos
│   │   └── login-success.json          # Dados mockados de login
│   ├── support/
│   │   ├── commands.js                 # Comandos customizados
│   │   └── e2e.js                      # Configurações globais
│   └── screenshots/                    # Screenshots de falhas
│       └── videos/                     # Vídeos dos testes
├── cypress.config.js                   # Configuração do Cypress
└── package.json
```

## 🎯 Cenários de Teste Implementados

### ✅ Cenário 1: Fluxo Crítico (Happy Path)
- Login com credenciais válidas
- Navegação pela aplicação
- Visualização de artigos
- Busca e filtros
- Logout

### ✅ Cenário 2: Validação de Formulários
- Validação de campos obrigatórios
- Validação de formato de email
- Validação de senha
- Mensagens de erro personalizadas

### ✅ Cenário 3: Interceptação de API
- Mock de resposta de sucesso (200)
- Simulação de erro 500
- Simulação de erro 401 (não autorizado)
- Timeout de rede
- Validação de tratamento de erros

### ✅ Cenário 4: Responsividade e UI
- Layout mobile (375x667)
- Layout tablet (768x1024)
- Layout desktop (1280x720)
- Menu hamburger em mobile
- Acessibilidade (alt tags, aria-labels)

## 🔧 Comandos Customizados

### `cy.login(email, password)`
Faz login no sistema de forma reutilizável.

```javascript
cy.login('admin@test.com', 'senha123');
```

### `cy.mockApiResponse(method, url, fixture, statusCode)`
Intercepta requisições e retorna dados mockados.

```javascript
cy.mockApiResponse('GET', '/api/articles', 'articles.json', 200);
```

### `cy.testResponsive(callback)`
Testa em múltiplos viewports automaticamente.

```javascript
cy.testResponsive((device, width, height) => {
  cy.log(`Testing on ${device}`);
  cy.get('.menu').should('be.visible');
});
```

### `cy.waitForLoading()`
Aguarda loader/spinner desaparecer.

```javascript
cy.waitForLoading();
cy.get('[data-testid="article-card"]').should('be.visible');
```

## 🎨 Boas Práticas Implementadas

### ✅ NUNCA use `cy.wait(5000)` fixo
❌ **Errado:**
```javascript
cy.wait(5000); // Espera fixa
```

✅ **Correto:**
```javascript
cy.get('.article').should('be.visible'); // Espera inteligente
```

### ✅ Use seletores semânticos
❌ **Evite:**
```javascript
cy.get('.css-class-12345').click();
```

✅ **Prefira:**
```javascript
cy.get('[data-testid="article-card"]').click();
cy.contains('button', 'Entrar').click();
```

### ✅ Organize com hooks
```javascript
beforeEach(() => {
  cy.visit('/');
  cy.clearLocalStorage();
});
```

### ✅ Use aliases para interceptações
```javascript
cy.intercept('GET', '/api/articles').as('getArticles');
cy.wait('@getArticles');
```

## 🐛 Debugging

### Ver testes em modo interativo
```bash
npm run cypress
```

### Analisar screenshots de falhas
```
cypress/screenshots/biblioteca-digital.cy.js/
```

### Assistir vídeos dos testes
```
cypress/videos/biblioteca-digital.cy.js.mp4
```

### Logs detalhados
Abra o Console do navegador durante execução interativa.

## 🔄 Integração Contínua (CI/CD)

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    npm install
    npm run build
    npm run e2e:headless
```

### GitLab CI
```yaml
e2e-tests:
  script:
    - npm install
    - npm run e2e:headless
  artifacts:
    paths:
      - cypress/screenshots
      - cypress/videos
```

## 📊 Relatórios

Cypress gera automaticamente:
- ✅ Screenshots de falhas
- ✅ Vídeos dos testes
- ✅ Relatório no terminal

Para relatórios HTML avançados, instale:
```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

## 🔐 Variáveis de Ambiente

Crie `.env` no diretório `client/`:

```env
CYPRESS_BASE_URL=http://localhost:3000
CYPRESS_API_URL=http://localhost:3001
```

Acesse no código:
```javascript
const apiUrl = Cypress.env('API_URL');
```

## 📝 Próximos Passos

- [ ] Adicionar testes de upload de PDF
- [ ] Testar importação BibTeX
- [ ] Testar gerenciamento de eventos
- [ ] Adicionar testes de performance
- [ ] Configurar relatórios HTML
- [ ] Integrar com CI/CD

## 🆘 Troubleshooting

### Erro: "Cannot find module 'cypress'"
```bash
npm install --save-dev cypress
```

### Testes muito lentos
Aumente os timeouts no `cypress.config.js`:
```javascript
defaultCommandTimeout: 10000
```

### Elementos não encontrados
Verifique se a aplicação está rodando:
```bash
npm start  # Em outro terminal
```

## 📚 Recursos

- [Documentação Cypress](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Cypress](https://testing-library.com/docs/cypress-testing-library/intro)

---

**Desenvolvido por:** Engenheiro de Automação Sênior  
**Data:** 2025  
**Framework:** Cypress 13.x + React 19.x
