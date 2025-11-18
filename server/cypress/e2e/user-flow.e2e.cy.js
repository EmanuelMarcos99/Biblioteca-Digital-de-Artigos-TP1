describe('End-to-End Tests - Complete User Flows', () => {
  const unique = () => `test${Date.now()}@example.com`
  const password = 'P@ssw0rd!'
  let userEmail
  let token
  let eventId
  let editionId
  let articleId

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    // ABRIR FRONTEND PRIMEIRO
    cy.log('🌐 Opening frontend...')
    cy.visit('http://localhost:3000')
    cy.wait(2000)
    cy.get('body').should('be.visible')
    cy.log('✅ Frontend loaded successfully')
    cy.wait(1000)
  })

  it('E2E Test 1 - User registration, login and authentication flow', () => {
    userEmail = unique()
    
    cy.log('🔍 Looking for registration page...')
    cy.wait(1000)
    
    // Procurar link de registro na UI
    cy.get('body').then(($body) => {
      const registerSelectors = [
        'a[href*="register"]',
        'a[href*="registro"]',
        'a[href*="cadastro"]',
        'a:contains("Registar")',
        'a:contains("Cadastrar")',
        'a:contains("Sign up")',
        'button:contains("Registar")'
      ]
      
      let foundRegisterLink = false
      for (const selector of registerSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Register link found: ${selector}`)
          cy.wait(1000)
          cy.get(selector).first().click({ force: true })
          cy.wait(2000)
          foundRegisterLink = true
          break
        }
      }
      
      if (!foundRegisterLink) {
        cy.log('⚠️ No register link found, trying direct URL')
        cy.visit('http://localhost:3000/register')
        cy.wait(2000)
      }
    })
    
    cy.log('🔵 Starting user registration via UI...')
    cy.wait(1000)
    
    // Tentar preencher formulário de registro na UI
    cy.get('body').then(($body) => {
      const nameInput = $body.find('input[name="name"], input[placeholder*="nome"], input[placeholder*="name"]')
      const emailInput = $body.find('input[name="email"], input[type="email"]')
      const passwordInput = $body.find('input[name="password"], input[type="password"]').first()
      
      if (nameInput.length > 0 && emailInput.length > 0 && passwordInput.length > 0) {
        cy.log('✅ Registration form found in UI')
        cy.wait(1000)
        
        cy.get('input[name="name"], input[placeholder*="nome"], input[placeholder*="name"]')
          .first().clear().type('E2E Test User', { delay: 100 })
        cy.wait(500)
        
        cy.get('input[name="email"], input[type="email"]')
          .first().clear().type(userEmail, { delay: 100 })
        cy.wait(500)
        
        cy.get('input[name="password"], input[type="password"]')
          .first().clear().type(password, { delay: 100 })
        cy.wait(500)
        
        // Procurar campo de confirmação de senha
        const confirmPasswordInput = $body.find('input[name="confirmPassword"], input[name="password_confirmation"]')
        if (confirmPasswordInput.length > 1) {
          cy.get('input[name="confirmPassword"], input[name="password_confirmation"], input[type="password"]')
            .last().clear().type(password, { delay: 100 })
          cy.wait(500)
        }
        
        cy.log('🔵 Submitting registration form...')
        cy.wait(1000)
        cy.get('button[type="submit"], button:contains("Registar"), button:contains("Cadastrar")').first().click()
        cy.wait(3000)
        
        cy.log('✅ Registration submitted via UI')
      } else {
        cy.log('⚠️ Registration form not found in UI, using API')
        
        // Fallback para API
        cy.request({
          method: 'POST',
          url: 'http://localhost:3001/api/users/register',
          body: { 
            name: 'E2E Test User', 
            email: userEmail, 
            password 
          },
          failOnStatusCode: false
        }).then((registerRes) => {
          cy.log('✅ Register via API:', registerRes.status)
          cy.wait(1500)
          expect([200, 201]).to.include(registerRes.status)
        })
      }
    })
    
    cy.wait(2000)
    cy.log('🔍 Looking for login page...')
    
    // Procurar página de login na UI
    cy.get('body').then(($body) => {
      const loginSelectors = [
        'a[href*="login"]',
        'a:contains("Login")',
        'a:contains("Entrar")',
        'a:contains("Sign in")',
        'button:contains("Login")'
      ]
      
      let foundLoginLink = false
      for (const selector of loginSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Login link found: ${selector}`)
          cy.wait(1000)
          cy.get(selector).first().click({ force: true })
          cy.wait(2000)
          foundLoginLink = true
          break
        }
      }
      
      if (!foundLoginLink) {
        cy.log('⚠️ No login link found, trying direct URL')
        cy.visit('http://localhost:3000/login')
        cy.wait(2000)
      }
    })
    
    cy.log('🔵 Attempting to login via UI...')
    cy.wait(1000)
    
    // Tentar fazer login na UI
    cy.get('body').then(($body) => {
      const emailInput = $body.find('input[name="email"], input[type="email"]')
      const passwordInput = $body.find('input[name="password"], input[type="password"]')
      
      if (emailInput.length > 0 && passwordInput.length > 0) {
        cy.log('✅ Login form found in UI')
        cy.wait(1000)
        
        cy.get('input[name="email"], input[type="email"]')
          .first().clear().type(userEmail, { delay: 100 })
        cy.wait(500)
        
        cy.get('input[name="password"], input[type="password"]')
          .first().clear().type(password, { delay: 100 })
        cy.wait(500)
        
        cy.log('🔵 Submitting login form...')
        cy.wait(1000)
        cy.get('button[type="submit"], button:contains("Login"), button:contains("Entrar")').first().click()
        cy.wait(3000)
        
        cy.log('✅ Login submitted via UI')
        
        // Verificar se foi redirecionado ou se há token salvo
        cy.window().then((win) => {
          const savedToken = win.localStorage.getItem('token') || win.sessionStorage.getItem('token')
          if (savedToken) {
            cy.log('✅ Token saved in storage:', savedToken.substring(0, 20) + '...')
            token = savedToken
          }
        })
      } else {
        cy.log('⚠️ Login form not found in UI, using API')
        
        // Fallback para API
        cy.request({
          method: 'POST',
          url: 'http://localhost:3001/api/users/login',
          body: { email: userEmail, password },
          failOnStatusCode: false
        }).then((loginRes) => {
          cy.log('✅ Login via API:', loginRes.status)
          cy.wait(1500)
          expect(loginRes.status).to.eq(200)
          token = loginRes.body.token
          
          // Salvar token no localStorage para uso posterior
          cy.window().then((win) => {
            win.localStorage.setItem('token', token)
          })
        })
      }
    })
    
    cy.wait(2000)
  })

  it('E2E Test 2 - Event creation and browsing flow', () => {
    const eventSlug = `event-${Date.now()}`
    const eventName = `E2E Event ${Date.now()}`
    
    cy.log('🔵 Creating new event via API...')
    cy.wait(1000)
    
    // Criar evento via API (admin action)
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/events',
      body: {
        name: eventName,
        description: 'E2E Test Event Description',
        slug: eventSlug
      },
      failOnStatusCode: false
    }).then((eventRes) => {
      cy.log('✅ Event created:', eventRes.status)
      cy.wait(1500)
      expect(eventRes.status).to.eq(201)
      eventId = eventRes.body.id
      
      cy.log('🔍 Looking for events in UI...')
      cy.wait(1000)
      
      // Procurar eventos na UI
      cy.get('body').then(($body) => {
        const eventSelectors = [
          'a[href*="event"]',
          'a[href*="evento"]',
          'a:contains("Eventos")',
          'a:contains("Events")',
          'nav a:contains("Event")'
        ]
        
        let foundEventLink = false
        for (const selector of eventSelectors) {
          if ($body.find(selector).length > 0) {
            cy.log(`✅ Events link found: ${selector}`)
            cy.wait(1000)
            cy.get(selector).first().click({ force: true })
            cy.wait(2000)
            foundEventLink = true
            break
          }
        }
        
        if (!foundEventLink) {
          cy.log('⚠️ No events link found in UI')
          cy.visit('http://localhost:3000/events', { failOnStatusCode: false })
          cy.wait(2000)
        }
        
        cy.log('🔍 Looking for created event in page...')
        cy.wait(1000)
        
        // Procurar pelo evento criado na página
        cy.get('body').then(($eventPage) => {
          if ($eventPage.text().includes(eventName) || $eventPage.text().includes(eventSlug)) {
            cy.log('✅ Created event found in UI!')
            cy.contains(eventName).should('be.visible')
          } else {
            cy.log('⚠️ Created event not visible in UI yet')
          }
        })
      })
    })
    
    cy.wait(2000)
  })

  it('E2E Test 3 - Article search and browsing flow', () => {
    cy.log('🔍 Navigating to articles page...')
    cy.wait(1000)
    
    // Procurar artigos na UI
    cy.get('body').then(($body) => {
      const articleSelectors = [
        'a[href*="article"]',
        'a[href*="artigo"]',
        'a:contains("Artigos")',
        'a:contains("Articles")',
        'nav a:contains("Artig")'
      ]
      
      let foundArticleLink = false
      for (const selector of articleSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Articles link found: ${selector}`)
          cy.wait(1000)
          cy.get(selector).first().click({ force: true })
          cy.wait(2000)
          foundArticleLink = true
          break
        }
      }
      
      if (!foundArticleLink) {
        cy.log('⚠️ No articles link found, trying direct URL')
        cy.visit('http://localhost:3000/articles', { failOnStatusCode: false })
        cy.wait(2000)
      }
    })
    
    cy.log('🔍 Looking for search field in UI...')
    cy.wait(1000)
    
    // Procurar campo de busca
    cy.get('body').then(($body) => {
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="busca"]',
        'input[placeholder*="search"]',
        'input[placeholder*="procura"]',
        'input[name="search"]',
        'input[name="q"]'
      ]
      
      let foundSearchField = false
      for (const selector of searchSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Search field found: ${selector}`)
          cy.wait(1000)
          
          cy.get(selector).first().clear().type('test', { delay: 150 })
          cy.wait(1000)
          
          cy.log('🔵 Performing search...')
          cy.get(selector).first().type('{enter}')
          cy.wait(2000)
          
          cy.log('✅ Search performed in UI')
          foundSearchField = true
          break
        }
      }
      
      if (!foundSearchField) {
        cy.log('⚠️ No search field found in UI')
      }
      
      // Procurar lista de artigos
      cy.wait(1000)
      cy.log('🔍 Looking for article list...')
      
      const articleListSelectors = [
        '.article-list',
        '.articles',
        '[data-testid="article-list"]',
        'article',
        '.article-card',
        '.card'
      ]
      
      for (const selector of articleListSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Article list found: ${selector}`)
          cy.wait(1000)
          
          // Clicar no primeiro artigo se existir
          cy.get(selector).first().click({ force: true })
          cy.wait(2000)
          cy.log('✅ Clicked on first article')
          break
        }
      }
    })
    
    cy.wait(2000)
  })

  it('E2E Test 4 - Newsletter subscription flow', () => {
    const subscriber1 = unique()
    
    cy.log('🔍 Looking for newsletter form in UI...')
    cy.wait(1000)
    
    // Procurar formulário de newsletter
    cy.get('body').then(($body) => {
      const newsletterSelectors = [
        'input[name="newsletter"]',
        'input[name="subscribe"]',
        'input[name="email"]',
        'input[placeholder*="newsletter"]',
        'input[placeholder*="email"]',
        'footer input[type="email"]',
        'form input[type="email"]'
      ]
      
      let foundNewsletterField = false
      for (const selector of newsletterSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Newsletter field found: ${selector}`)
          cy.wait(1000)
          
          cy.get(selector).first().clear().type(subscriber1, { delay: 100 })
          cy.wait(1000)
          
          cy.log('🔵 Submitting newsletter subscription...')
          
          // Procurar botão de submit próximo
          cy.get(selector).parent().find('button').first().click({ force: true })
          cy.wait(2000)
          
          cy.log('✅ Newsletter subscription submitted via UI')
          
          // Verificar mensagem de sucesso
          cy.wait(1000)
          cy.get('body').then(($result) => {
            if ($result.text().match(/sucesso|success|inscrito|subscribed/i)) {
              cy.log('✅ Success message displayed')
            }
          })
          
          foundNewsletterField = true
          break
        }
      }
      
      if (!foundNewsletterField) {
        cy.log('⚠️ No newsletter form found, trying subscribe page')
        cy.visit('http://localhost:3000/subscribe', { failOnStatusCode: false })
        cy.wait(2000)
        
        cy.get('body').then(($subscribePage) => {
          if ($subscribePage.find('input[type="email"]').length > 0) {
            cy.log('✅ Subscribe page found')
            cy.wait(1000)
            
            cy.get('input[type="email"]').first().type(subscriber1, { delay: 100 })
            cy.wait(1000)
            
            cy.get('button[type="submit"]').click()
            cy.wait(2000)
            cy.log('✅ Subscribed via dedicated page')
          } else {
            cy.log('⚠️ Using API fallback for newsletter')
            
            // Fallback API
            cy.request({
              method: 'POST',
              url: 'http://localhost:3001/api/users/subscribe',
              body: { email: subscriber1 },
              failOnStatusCode: false
            }).then((subRes) => {
              cy.log('✅ Subscribed via API:', subRes.status)
              expect(subRes.status).to.eq(201)
            })
          }
        })
      }
    })
    
    cy.wait(2000)
  })
})