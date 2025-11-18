const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // URL base da aplicação React
    baseUrl: 'http://localhost:3000',
    
    // URL da API backend
    env: {
      apiUrl: 'http://localhost:3001'
    },
    
    // Configurações de viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeout padrão para comandos
    defaultCommandTimeout: 10000,
    
    // Timeout para page load
    pageLoadTimeout: 30000,
    
    // Configuração de vídeos e screenshots
    video: true,
    screenshotOnRunFailure: true,
    
    // Configuração de retry
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      // Implementar event listeners aqui se necessário
      return config;
    },
    
    // Padrão de arquivos de teste
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Suporte a múltiplos navegadores
    experimentalWebKitSupport: false,
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
