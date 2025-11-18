// ***********************************************
// COMANDOS CUSTOMIZADOS PARA CYPRESS
// ***********************************************

import '@testing-library/cypress/add-commands';

// ============================================================================
// COMANDO: LOGIN
// Comando reutilizável para fazer login no sistema
// ============================================================================
Cypress.Commands.add('login', (email = 'admin@test.com', password = 'senha123') => {
  cy.session([email, password], () => {
    cy.visit('/login');
    
    // Preencher formulário de login
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    
    // Submeter formulário
    cy.contains('button', /entrar|login/i).click();
    
    // Aguardar redirecionamento e salvar token
    cy.url().should('not.include', '/login');
    
    // Verificar se token foi salvo no localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.exist;
    });
  });
});

// ============================================================================
// COMANDO: INTERCEPTAR API
// Facilita o mock de respostas da API
// ============================================================================
Cypress.Commands.add('mockApiResponse', (method, url, fixture, statusCode = 200) => {
  cy.intercept(method, url, {
    statusCode,
    fixture,
  }).as('apiRequest');
});

// ============================================================================
// COMANDO: VERIFICAR RESPONSIVIDADE
// Testa múltiplos viewports
// ============================================================================
Cypress.Commands.add('testResponsive', (callback) => {
  const viewports = [
    { device: 'mobile', width: 375, height: 667 },
    { device: 'tablet', width: 768, height: 1024 },
    { device: 'desktop', width: 1280, height: 720 },
  ];

  viewports.forEach(({ device, width, height }) => {
    cy.viewport(width, height);
    cy.log(`Testing on ${device} (${width}x${height})`);
    callback(device, width, height);
  });
});

// ============================================================================
// COMANDO: LIMPAR DADOS DE TESTE
// Útil para garantir estado limpo entre testes
// ============================================================================
Cypress.Commands.add('cleanDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/test/reset`,
    failOnStatusCode: false,
  });
});

// ============================================================================
// COMANDO: AGUARDAR CARREGAMENTO
// Aguarda loader ou spinner desaparecer
// ============================================================================
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
  cy.get('.spinner', { timeout: 10000 }).should('not.exist');
  cy.get('.loading', { timeout: 10000 }).should('not.exist');
});
