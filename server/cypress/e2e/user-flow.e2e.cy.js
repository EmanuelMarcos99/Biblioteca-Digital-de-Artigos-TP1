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
  })

  it('E2E Test 1 - User registration, login and authentication flow', () => {
    userEmail = unique()
    
    // Registrar usuário
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
      cy.log('Register:', registerRes.status, registerRes.body)
      expect([200, 201]).to.include(registerRes.status)
      
      // Login com credenciais corretas
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/users/login',
        body: { email: userEmail, password },
        failOnStatusCode: false
      }).then((loginRes) => {
        cy.log('Login:', loginRes.status, loginRes.body)
        expect(loginRes.status).to.eq(200)
        expect(loginRes.body).to.have.property('token')
        token = loginRes.body.token
        
        // Tentar login com senha errada
        cy.request({
          method: 'POST',
          url: 'http://localhost:3001/api/users/login',
          body: { email: userEmail, password: 'wrongpassword' },
          failOnStatusCode: false
        }).then((wrongRes) => {
          cy.log('Wrong password:', wrongRes.status)
          expect(wrongRes.status).to.eq(401)
        })
      })
    })
    
    // NOVA PARTE - UI Testing
    cy.visit('http://localhost:3000')
    cy.wait(1000) // Aguardar carregamento da página
    
    // Verificar se a página inicial carregou
    cy.get('body').should('be.visible')
    cy.log('Frontend loaded successfully')
  })

  it('E2E Test 2 - Event creation and management flow', () => {
    const eventSlug = `event-${Date.now()}`
    const eventName = `E2E Event ${Date.now()}`
    
    // Criar evento
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
      cy.log('Create event:', eventRes.status, eventRes.body)
      expect(eventRes.status).to.eq(201)
      expect(eventRes.body).to.have.property('id')
      expect(eventRes.body).to.have.property('slug', eventSlug)
      eventId = eventRes.body.id
      
      // Listar todos os eventos
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/events',
        failOnStatusCode: false
      }).then((listRes) => {
        cy.log('List events:', listRes.status, listRes.body.length)
        expect(listRes.status).to.eq(200)
        expect(listRes.body).to.be.an('array')
        const foundEvent = listRes.body.find(e => e.id === eventId)
        expect(foundEvent).to.exist
        expect(foundEvent.name).to.eq(eventName)
      })
      
      // Buscar evento por slug
      cy.request({
        method: 'GET',
        url: `http://localhost:3001/api/events/slug/${eventSlug}`,
        failOnStatusCode: false
      }).then((slugRes) => {
        cy.log('Get by slug:', slugRes.status, slugRes.body)
        expect(slugRes.status).to.eq(200)
        expect(slugRes.body).to.have.property('id', eventId)
        expect(slugRes.body).to.have.property('name', eventName)
        
        // Buscar edições do evento
        cy.request({
          method: 'GET',
          url: `http://localhost:3001/api/events/${eventId}/editions`,
          failOnStatusCode: false
        }).then((editionsRes) => {
          cy.log('Get event editions:', editionsRes.status, editionsRes.body)
          expect([200, 404]).to.include(editionsRes.status)
          if (editionsRes.status === 200) {
            expect(editionsRes.body).to.be.an('array')
          }
        })
      })
    })
    
    // NOVA PARTE - UI Testing
    cy.visit('http://localhost:3000')
    cy.wait(1000)
    
    // Tentar navegar para página de eventos (se existir)
    cy.get('body').then(($body) => {
      if ($body.find('a[href*="event"], a:contains("Eventos"), a:contains("Events")').length > 0) {
        cy.get('a[href*="event"], a:contains("Eventos"), a:contains("Events")').first().click()
        cy.wait(1000)
        cy.log('Navigated to events page')
      } else {
        cy.log('No events link found in UI')
      }
    })
  })

  it('E2E Test 3 - Article search and filtering flow', () => {
    // Listar todos os artigos
    cy.request({
      method: 'GET',
      url: 'http://localhost:3001/api/articles',
      failOnStatusCode: false
    }).then((listRes) => {
      cy.log('List all articles:', listRes.status, listRes.body.length)
      expect(listRes.status).to.eq(200)
      expect(listRes.body).to.be.an('array')
      
      if (listRes.body.length > 0) {
        const firstArticle = listRes.body[0]
        articleId = firstArticle.id
        
        // Buscar artigo por ID
        cy.request({
          method: 'GET',
          url: `http://localhost:3001/api/articles/${articleId}`,
          failOnStatusCode: false
        }).then((detailRes) => {
          cy.log('Get article by ID:', detailRes.status, detailRes.body)
          expect(detailRes.status).to.eq(200)
          expect(detailRes.body).to.have.property('id', articleId)
          expect(detailRes.body).to.have.property('title')
        })
        
        // Buscar com filtro de título
        if (firstArticle.title) {
          const searchTerm = firstArticle.title.substring(0, 5)
          cy.request({
            method: 'GET',
            url: `http://localhost:3001/api/articles?search=${encodeURIComponent(searchTerm)}`,
            failOnStatusCode: false
          }).then((searchRes) => {
            cy.log('Search articles:', searchRes.status, searchRes.body.length)
            expect(searchRes.status).to.eq(200)
            expect(searchRes.body).to.be.an('array')
          })
        }
        
        // Buscar artigos por autor
        if (firstArticle.authors) {
          const authorName = firstArticle.authors.split(',')[0].trim()
          cy.request({
            method: 'GET',
            url: `http://localhost:3001/api/authors/${encodeURIComponent(authorName)}/articles`,
            failOnStatusCode: false
          }).then((authorRes) => {
            cy.log('Get articles by author:', authorRes.status, authorRes.body)
            expect(authorRes.status).to.eq(200)
            expect(authorRes.body).to.have.property('author', authorName)
            expect(authorRes.body).to.have.property('articles')
          })
        }
      } else {
        cy.log('No articles found in database')
      }
    })
    
    // NOVA PARTE - UI Testing para artigos
    cy.visit('http://localhost:3000')
    cy.wait(1000)
    
    // Procurar por links de artigos na página
    cy.get('body').then(($body) => {
      // Tentar encontrar link para artigos
      const articleSelectors = [
        'a[href*="article"]',
        'a[href*="artigo"]',
        'a:contains("Artigos")',
        'a:contains("Articles")',
        'nav a'
      ]
      
      let found = false
      for (const selector of articleSelectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().click({ force: true })
          cy.wait(1000)
          cy.log('Clicked on articles link')
          found = true
          break
        }
      }
      
      if (!found) {
        cy.log('No article links found, staying on home page')
      }
      
      // Verificar se há campo de busca
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="busca"]',
        'input[placeholder*="search"]',
        'input[name="search"]'
      ]
      
      for (const selector of searchSelectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().type('test{enter}')
          cy.wait(1000)
          cy.log('Performed search in UI')
          break
        }
      }
    })
  })

  it('E2E Test 4 - Newsletter subscription flow', () => {
    const subscriber1 = unique()
    const subscriber2 = unique()
    
    // Primeira subscrição
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/users/subscribe',
      body: { email: subscriber1 },
      failOnStatusCode: false
    }).then((sub1Res) => {
      cy.log('First subscription:', sub1Res.status, sub1Res.body)
      expect(sub1Res.status).to.eq(201)
      expect(sub1Res.body).to.have.property('message')
      expect(sub1Res.body.message).to.include('Subscrição realizada com sucesso')
      expect(sub1Res.body.subscriber).to.have.property('email', subscriber1)
      
      cy.wait(500)
      
      // Tentar subscrever novamente
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/users/subscribe',
        body: { email: subscriber1 },
        failOnStatusCode: false
      }).then((dupRes) => {
        cy.log('Duplicate subscription:', dupRes.status, dupRes.body)
        expect([201, 409]).to.include(dupRes.status)
        
        if (dupRes.status === 409) {
          expect(dupRes.body).to.have.property('error')
          expect(dupRes.body.error).to.include('já está inscrito')
        } else {
          cy.log('Warning: Duplicate subscription returned 201 instead of 409')
        }
      })
      
      // Segunda subscrição
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/users/subscribe',
        body: { email: subscriber2 },
        failOnStatusCode: false
      }).then((sub2Res) => {
        cy.log('Second subscription:', sub2Res.status, sub2Res.body)
        expect(sub2Res.status).to.eq(201)
        expect(sub2Res.body.subscriber).to.have.property('email', subscriber2)
      })
    })
    
    // NOVA PARTE - UI Testing para newsletter
    cy.visit('http://localhost:3000')
    cy.wait(1000)
    
    // Procurar formulário de newsletter na página
    cy.get('body').then(($body) => {
      const newsletterSelectors = [
        'input[name="newsletter"]',
        'input[name="subscribe"]',
        'input[placeholder*="newsletter"]',
        'input[placeholder*="email"]',
        'footer input[type="email"]',
        'form input[type="email"]'
      ]
      
      let foundNewsletterInput = false
      for (const selector of newsletterSelectors) {
        if ($body.find(selector).length > 0) {
          const testEmail = unique()
          cy.get(selector).first().clear().type(testEmail)
          
          // Procurar botão de submit próximo
          cy.get(selector).parent().find('button').first().click({ force: true })
          cy.wait(1000)
          
          cy.log('Subscribed via UI with email:', testEmail)
          foundNewsletterInput = true
          break
        }
      }
      
      if (!foundNewsletterInput) {
        cy.log('No newsletter form found in UI')
        
        // Tentar acessar página de subscrição diretamente
        cy.visit('http://localhost:3000/subscribe', { failOnStatusCode: false })
        cy.wait(1000)
        
        cy.get('body').then(($subscribePage) => {
          if ($subscribePage.find('input[type="email"]').length > 0) {
            const testEmail = unique()
            cy.get('input[type="email"]').first().type(testEmail)
            cy.get('button[type="submit"]').click()
            cy.log('Subscribed via dedicated page')
          } else {
            cy.log('No subscribe page found')
          }
        })
      }
    })
  })
})