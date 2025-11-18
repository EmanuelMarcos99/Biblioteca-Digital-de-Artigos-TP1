module.exports = {
  testEnvironment: 'node',
  // ✅ ADICIONE ESTA LINHA:
  collectCoverage: true, 
  
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};