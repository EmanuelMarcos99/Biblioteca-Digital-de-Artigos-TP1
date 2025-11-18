describe('User Flow - Real End-to-End Tests', () => {
  const unique = () => `test${Date.now()}@example.com`
  let email
  const password = 'P@ssw0rd!'
  const userName = 'E2E Test User'

  beforeEach(() => {
    // Limpar cookies e storage antes de cada teste
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('E2E Test 1 - Complete user registration flow', () => {
    email = unique()
    
    // Visitar página de registro
    cy.visit('http://localhost:3000/register')
    cy.url().should('include', '/register')
    
    // Preencher formulário de registro
    cy.get('input[name="name"]', { timeout: 10000 }).should('be.visible').type(userName)
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('input[name="confirmPassword"]').type(password)
    
    // Submeter formulário
    cy.get('button[type="submit"]').contains(/registar|cadastrar|sign up/i).click()
    
    // Verificar sucesso - pode redirecionar para login ou dashboard
    cy.url({ timeout: 10000 }).should('match', /\/(login|dashboard|home)/)
    
    // Verificar mensagem de sucesso (toast, alert, etc)
    cy.contains(/sucesso|success|bem-vindo|welcome/i, { timeout: 5000 }).should('exist')
  })

  it('E2E Test 2 - Login and navigate to dashboard', () => {
    // Primeiro registrar usuário via API para garantir que existe
    email = unique()
    cy.request('POST', 'http://localhost:3001/api/users/register', {
      name: userName,
      email,
      password
    })
    
    // Visitar página de login
    cy.visit('http://localhost:3000/login')
    cy.url().should('include', '/login')
    
    // Fazer login
    cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').contains(/entrar|login|sign in/i).click()
    
    // Verificar redirecionamento para dashboard/home
    cy.url({ timeout: 10000 }).should('match', /\/(dashboard|home|articles)/)
    
    // Verificar que o nome do usuário aparece na tela
    cy.contains(userName, { timeout: 5000 }).should('be.visible')
    
    // Verificar que o token foi salvo
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token')
      expect(token).to.exist
    })
  })

  it('E2E Test 3 - Browse articles and view details', () => {
    // Registrar e fazer login via API
    email = unique()
    cy.request('POST', 'http://localhost:3001/api/users/register', {
      name: userName,
      email,
      password
    }).then(() => {
      return cy.request('POST', 'http://localhost:3001/api/users/login', {
        email,
        password
      })
    }).then((response) => {
      // Salvar token no localStorage
      window.localStorage.setItem('token', response.body.token)
    })
    
    // Visitar página de artigos
    cy.visit('http://localhost:3000/articles')
    cy.url().should('include', '/articles')
    
    // Verificar que a lista de artigos carregou
    cy.get('[data-testid="article-list"], .article-list, .articles-container', { timeout: 10000 })
      .should('exist')
    
    // Verificar que há pelo menos um artigo (ou mensagem de vazio)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="article-item"], .article-item, .article-card').length > 0) {
        // Se existem artigos, clicar no primeiro
        cy.get('[data-testid="article-item"], .article-item, .article-card').first().click()
        
        // Verificar que abriu o detalhe do artigo
        cy.url({ timeout: 5000 }).should('match', /\/articles\/\d+/)
        
        // Verificar elementos do detalhe
        cy.get('[data-testid="article-title"], .article-title, h1', { timeout: 5000 }).should('be.visible')
      } else {
        // Se não há artigos, verificar mensagem
        cy.contains(/nenhum artigo|no articles|empty/i).should('be.visible')
      }
    })
  })

  it('E2E Test 4 - Subscribe to newsletter', () => {
    const subscriberEmail = unique()
    
    // Visitar página inicial ou de subscrição
    cy.visit('http://localhost:3000')
    
    // Procurar formulário de newsletter (pode estar em footer, header, ou página dedicada)
    cy.get('body').then(($body) => {
      // Tentar encontrar input de email para newsletter
      const selectors = [
        'input[name="newsletter"]',
        'input[name="subscribe"]',
        'input[placeholder*="email"]',
        'input[type="email"]'
      ]
      
      let found = false
      for (const selector of selectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().type(subscriberEmail)
          found = true
          break
        }
      }
      
      if (!found) {
        // Se não encontrou na home, tentar página dedicada
        cy.visit('http://localhost:3000/subscribe')
        cy.get('input[type="email"]', { timeout: 5000 }).type(subscriberEmail)
      }
    })
    
    // Clicar no botão de subscrição
    cy.get('button').contains(/subscrever|subscribe|assinar/i).click()
    
    // Verificar mensagem de sucesso
    cy.contains(/sucesso|success|subscribed|obrigado|thank you/i, { timeout: 5000 })
      .should('be.visible')
    
    // Verificar que o email foi registrado via API
    cy.request({
      method: 'GET',
      url: 'http://localhost:3001/api/users/subscribers',
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        expect(response.body.some(sub => sub.email === subscriberEmail)).to.be.true
      }
    })
  })
})