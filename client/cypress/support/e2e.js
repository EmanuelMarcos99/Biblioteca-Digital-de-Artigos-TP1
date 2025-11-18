// ***********************************************
// ARQUIVO DE SUPORTE PRINCIPAL DO CYPRESS
// Importa comandos customizados e configurações globais
// ***********************************************

import './commands';

// Importar comandos do Testing Library
import '@testing-library/cypress/add-commands';

// ============================================================================
// CONFIGURAÇÕES GLOBAIS
// ============================================================================

// Prevenir falhas de testes por erros não capturados
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar erros específicos que não devem falhar os testes
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  if (err.message.includes('hydration')) {
    return false;
  }
  // Permitir que outros erros falhem os testes
  return true;
});

// ============================================================================
// HOOKS GLOBAIS
// ============================================================================

// Executar antes de cada teste
beforeEach(() => {
  // Limpar localStorage e sessionStorage
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Preservar token de autenticação se existir
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// ============================================================================
// CONFIGURAÇÕES DE REDE
// ============================================================================

// Log de todas as requisições de rede
if (Cypress.config('isInteractive')) {
  Cypress.on('window:before:load', (win) => {
    const originalFetch = win.fetch;
    win.fetch = function (...args) {
      console.log('🌐 Fetch Request:', args[0]);
      return originalFetch.apply(this, args);
    };
  });
}
