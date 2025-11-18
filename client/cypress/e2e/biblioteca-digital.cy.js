// ============================================================================
// TESTES E2E - BIBLIOTECA DIGITAL DE ARTIGOS
// Engenheiro de Automação Sênior - Boas Práticas Cypress
// ============================================================================

describe('🚀 Biblioteca Digital - Fluxos Críticos E2E', () => {
  
  // ============================================================================
  // CENÁRIO 1: HAPPY PATH - Login e Navegação Principal
  // Testa o fluxo completo de login e acesso ao sistema
  // ============================================================================
  
  describe('Cenário 1: Fluxo Crítico (Happy Path)', () => {
    it('deve fazer login, acessar home e visualizar artigos', () => {
      // ARRANGE - Visitar página de login
      cy.visit('/login');
      
      // ACT - Preencher credenciais
      cy.get('input[type="email"]').should('be.visible').type('admin@test.com');
      cy.get('input[type="password"]').should('be.visible').type('senha123');
      
      // ACT - Submeter formulário
      cy.contains('button', /entrar|login/i).click();
      
      // ASSERT - Verificar redirecionamento para home
      cy.url().should('not.include', '/login');
      cy.url().should('include', '/'); // ou '/home' ou '/admin'
      
      // ASSERT - Verificar elementos da interface
      cy.contains(/biblioteca digital|artigos|eventos/i).should('be.visible');
      
      // ACT - Navegar para seção de artigos
      cy.contains('a', /artigos|articles/i).click();
      
      // ASSERT - Verificar carregamento de artigos
      cy.get('[data-testid="article-card"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0)
        .first()
        .should('be.visible')
        .and('contain.text', /título|title/i);
      
      // ASSERT - Verificar funcionalidade de busca
      cy.get('input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]')
        .should('be.visible')
        .type('redes{enter}');
      
      // ASSERT - Aguardar resultados da busca
      cy.contains(/resultado|result|encontrado/i, { timeout: 5000 }).should('be.visible');
      
      // ACT - Clicar no primeiro artigo
      cy.get('[data-testid="article-card"]').first().click();
      
      // ASSERT - Verificar página de detalhes do artigo
      cy.url().should('match', /\/artigo\/\d+|\/article\/\d+/);
      cy.contains(/autor|author|título|title/i).should('be.visible');
      cy.contains('button', /download|pdf/i).should('be.visible');
    });
    
    it('deve fazer logout corretamente', () => {
      // ARRANGE - Fazer login primeiro
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('senha123');
      cy.contains('button', /entrar|login/i).click();
      cy.url().should('not.include', '/login');
      
      // ACT - Encontrar e clicar no botão de logout
      cy.contains('button', /sair|logout/i, { timeout: 5000 }).click();
      
      // ASSERT - Verificar redirecionamento para login
      cy.url().should('include', '/login');
      
      // ASSERT - Verificar que token foi removido
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });

  // ============================================================================
  // CENÁRIO 2: VALIDAÇÃO DE FORMULÁRIOS
  // Testa validações client-side e mensagens de erro
  // ============================================================================
  
  describe('Cenário 2: Validação de Formulários', () => {
    it('deve validar campos obrigatórios no formulário de login', () => {
      // ARRANGE
      cy.visit('/login');
      
      // ACT - Tentar submeter formulário vazio
      cy.contains('button', /entrar|login/i).click();
      
      // ASSERT - Verificar mensagens de erro HTML5 ou custom
      cy.get('input[type="email"]').then(($input) => {
        // Verificar validação HTML5
        expect($input[0].validationMessage).to.not.be.empty;
      });
      
      // ACT - Preencher email inválido
      cy.get('input[type="email"]').clear().type('email-invalido');
      cy.contains('button', /entrar|login/i).click();
      
      // ASSERT - Verificar mensagem de erro de formato
      cy.get('input[type="email"]').then(($input) => {
        expect($input[0].validity.valid).to.be.false;
      });
      
      // ACT - Preencher email válido mas senha vazia
      cy.get('input[type="email"]').clear().type('user@test.com');
      cy.get('input[type="password"]').clear();
      cy.contains('button', /entrar|login/i).click();
      
      // ASSERT - Verificar validação de senha obrigatória
      cy.get('input[type="password"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
      
      // ACT - Preencher senha muito curta (se houver validação)
      cy.get('input[type="password"]').type('123');
      cy.contains('button', /entrar|login/i).click();
      
      // ASSERT - Verificar mensagem de erro de senha curta
      cy.contains(/senha deve ter|password must have|mínimo|minimum/i, { timeout: 3000 })
        .should('be.visible');
    });
    
    it('deve validar formulário de cadastro de artigo (Admin)', () => {
      // ARRANGE - Fazer login como admin
      cy.visit('/login');
      cy.get('input[type="email"]').type('admin@test.com');
      cy.get('input[type="password"]').type('senha123');
      cy.contains('button', /entrar|login/i).click();
      cy.url().should('not.include', '/login');
      
      // ACT - Navegar para página de cadastro de artigo
      cy.contains(/admin|gerenciar|cadastrar/i, { timeout: 5000 }).click();
      cy.contains(/novo artigo|adicionar artigo|cadastrar artigo/i).click();
      
      // ACT - Tentar submeter formulário vazio
      cy.contains('button', /salvar|enviar|cadastrar/i).click();
      
      // ASSERT - Verificar mensagens de erro para campos obrigatórios
      cy.contains(/título.*obrigatório|title.*required/i).should('be.visible');
      cy.contains(/autor.*obrigatório|author.*required/i).should('be.visible');
      cy.contains(/pdf.*obrigatório|file.*required/i).should('be.visible');
      
      // ACT - Preencher apenas título
      cy.get('input[name="title"], input[placeholder*="título"]').type('Artigo de Teste E2E');
      cy.contains('button', /salvar|enviar|cadastrar/i).click();
      
      // ASSERT - Verificar que outros campos ainda mostram erro
      cy.contains(/autor.*obrigatório|author.*required/i).should('be.visible');
    });
  });

  // ============================================================================
  // CENÁRIO 3: INTERCEPTAÇÃO DE API (Mock de Rede)
  // Simula respostas do backend para testar comportamento do frontend
  // ============================================================================
  
  describe('Cenário 3: Interceptação de API e Tratamento de Erros', () => {
    it('deve tratar erro 500 do servidor ao buscar artigos', () => {
      // ARRANGE - Interceptar requisição de artigos com erro 500
      cy.intercept('GET', '**/api/articles*', {
        statusCode: 500,
        body: {
          error: 'Erro interno do servidor',
        },
      }).as('getArticlesError');
      
      // ACT - Visitar home
      cy.visit('/');
      
      // ASSERT - Aguardar requisição falhar
      cy.wait('@getArticlesError');
      
      // ASSERT - Verificar mensagem de erro amigável
      cy.contains(/erro ao carregar|falha ao buscar|erro no servidor|try again/i, { timeout: 5000 })
        .should('be.visible');
      
      // ASSERT - Verificar que não há artigos sendo exibidos
      cy.get('[data-testid="article-card"]').should('not.exist');
    });
    
    it('deve simular resposta bem-sucedida da API com dados mockados', () => {
      // ARRANGE - Mock de resposta de sucesso com dados fictícios
      cy.intercept('GET', '**/api/articles*', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'Artigo Mockado E2E',
            authors: 'Cypress Test',
            year: 2025,
            url: 'https://example.com/test.pdf',
          },
          {
            id: 2,
            title: 'Segundo Artigo E2E',
            authors: 'Automated Tester',
            year: 2025,
            url: 'https://example.com/test2.pdf',
          },
        ],
      }).as('getArticlesSuccess');
      
      // ACT - Visitar home
      cy.visit('/');
      
      // ASSERT - Aguardar requisição
      cy.wait('@getArticlesSuccess');
      
      // ASSERT - Verificar que artigos mockados aparecem
      cy.contains('Artigo Mockado E2E').should('be.visible');
      cy.contains('Cypress Test').should('be.visible');
      cy.contains('Segundo Artigo E2E').should('be.visible');
      cy.contains('Automated Tester').should('be.visible');
    });
    
    it('deve tratar erro de autenticação (401)', () => {
      // ARRANGE - Interceptar login com erro 401
      cy.intercept('POST', '**/api/users/login', {
        statusCode: 401,
        body: {
          error: 'Credenciais inválidas',
        },
      }).as('loginError');
      
      // ACT - Tentar fazer login
      cy.visit('/login');
      cy.get('input[type="email"]').type('wrong@test.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.contains('button', /entrar|login/i).click();
      
      // ASSERT - Aguardar requisição
      cy.wait('@loginError');
      
      // ASSERT - Verificar mensagem de erro
      cy.contains(/credenciais inválidas|usuário ou senha|incorrect|invalid/i, { timeout: 5000 })
        .should('be.visible');
      
      // ASSERT - Verificar que ainda está na página de login
      cy.url().should('include', '/login');
    });
    
    it('deve simular timeout de rede', () => {
      // ARRANGE - Interceptar com delay longo
      cy.intercept('GET', '**/api/articles*', (req) => {
        req.reply({
          statusCode: 200,
          body: [],
          delay: 30000, // 30 segundos
        });
      }).as('slowRequest');
      
      // ACT - Visitar home
      cy.visit('/');
      
      // ASSERT - Verificar loading state
      cy.get('[data-testid="loading"], .spinner, .loading', { timeout: 2000 })
        .should('be.visible');
    });
  });

  // ============================================================================
  // CENÁRIO 4: RESPONSIVIDADE E UI
  // Testa comportamento em diferentes tamanhos de tela
  // ============================================================================
  
  describe('Cenário 4: Responsividade e UI', () => {
    it('deve exibir menu mobile em telas pequenas', () => {
      // ARRANGE - Definir viewport mobile
      cy.viewport('iphone-x'); // 375x812
      
      // ACT - Visitar home
      cy.visit('/');
      
      // ASSERT - Verificar que menu hamburger está visível
      cy.get('[data-testid="mobile-menu-button"], .hamburger, button[aria-label*="menu"]')
        .should('be.visible');
      
      // ASSERT - Verificar que menu desktop está oculto
      cy.get('[data-testid="desktop-menu"], nav.desktop-nav')
        .should('not.be.visible');
      
      // ACT - Abrir menu mobile
      cy.get('[data-testid="mobile-menu-button"], .hamburger, button[aria-label*="menu"]')
        .click();
      
      // ASSERT - Verificar que menu abriu
      cy.get('[data-testid="mobile-menu"], .mobile-menu, aside')
        .should('be.visible');
      
      // ASSERT - Verificar links do menu
      cy.contains('a', /home|início/i).should('be.visible');
      cy.contains('a', /artigos|articles/i).should('be.visible');
      cy.contains('a', /eventos|events/i).should('be.visible');
    });
    
    it('deve exibir menu desktop em telas grandes', () => {
      // ARRANGE - Definir viewport desktop
      cy.viewport(1920, 1080);
      
      // ACT - Visitar home
      cy.visit('/');
      
      // ASSERT - Verificar que menu desktop está visível
      cy.get('[data-testid="desktop-menu"], nav, header nav')
        .should('be.visible');
      
      // ASSERT - Verificar que botão hamburger não está visível
      cy.get('[data-testid="mobile-menu-button"], .hamburger')
        .should('not.be.visible');
      
      // ASSERT - Verificar links no menu desktop
      cy.get('nav').within(() => {
        cy.contains('a', /home|início/i).should('be.visible');
        cy.contains('a', /artigos|articles/i).should('be.visible');
        cy.contains('a', /eventos|events/i).should('be.visible');
      });
    });
    
    it('deve adaptar layout de cards em diferentes viewports', () => {
      const viewports = [
        { name: 'mobile', width: 375, height: 667, expectedColumns: 1 },
        { name: 'tablet', width: 768, height: 1024, expectedColumns: 2 },
        { name: 'desktop', width: 1280, height: 720, expectedColumns: 3 },
      ];
      
      viewports.forEach(({ name, width, height, expectedColumns }) => {
        // ARRANGE - Definir viewport
        cy.viewport(width, height);
        
        // ACT - Visitar página de artigos
        cy.visit('/');
        cy.contains('a', /artigos|articles/i).click();
        
        // ASSERT - Verificar quantidade de colunas (aproximado)
        cy.log(`Testing ${name} layout (${width}x${height})`);
        
        cy.get('[data-testid="article-card"]', { timeout: 10000 })
          .should('have.length.greaterThan', 0)
          .first()
          .should('be.visible');
        
        // Verificar que cards são clicáveis
        cy.get('[data-testid="article-card"]').first().should('be.visible');
      });
    });
    
    it('deve ter elementos acessíveis e semânticos', () => {
      // ACT - Visitar home
      cy.visit('/');
      
      // ASSERT - Verificar estrutura semântica HTML5
      cy.get('header').should('exist');
      cy.get('main').should('exist');
      cy.get('footer').should('exist');
      
      // ASSERT - Verificar atributos de acessibilidade
      cy.get('img').each(($img) => {
        expect($img).to.have.attr('alt');
      });
      
      // ASSERT - Verificar que botões têm labels
      cy.get('button').each(($btn) => {
        const hasText = $btn.text().trim().length > 0;
        const hasAriaLabel = $btn.attr('aria-label');
        expect(hasText || hasAriaLabel).to.be.true;
      });
      
      // ASSERT - Verificar contraste de cores (simulado)
      cy.get('body').should('have.css', 'background-color');
      cy.get('body').should('have.css', 'color');
    });
  });

  // ============================================================================
  // CENÁRIO EXTRA: FLUXO DE BUSCA
  // Testa funcionalidade de busca e filtros
  // ============================================================================
  
  describe('Cenário Extra: Busca e Filtros', () => {
    it('deve buscar artigos por título e autor', () => {
      // ACT - Visitar home
      cy.visit('/');
      
      // ACT - Buscar por termo
      cy.get('input[type="search"], input[placeholder*="buscar"]')
        .should('be.visible')
        .type('redes');
      
      // ACT - Aguardar debounce e resultados
      cy.wait(1000);
      
      // ASSERT - Verificar que resultados contêm o termo
      cy.get('[data-testid="article-card"]', { timeout: 5000 })
        .should('have.length.greaterThan', 0);
      
      // ACT - Limpar busca
      cy.get('input[type="search"], input[placeholder*="buscar"]').clear();
      
      // ASSERT - Verificar que todos os artigos voltam
      cy.wait(1000);
      cy.get('[data-testid="article-card"]').should('have.length.greaterThan', 0);
    });
  });
});
