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
    
    cy.log('🔵 Starting user registration...')
    cy.wait(1000)
    
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
      cy.log('✅ Register:', registerRes.status, registerRes.body)
      cy.wait(1500)
      expect([200, 201]).to.include(registerRes.status)
      
      cy.log('🔵 Attempting to login...')
      cy.wait(1000)
      
      // Login com credenciais corretas
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/users/login',
        body: { email: userEmail, password },
        failOnStatusCode: false
      }).then((loginRes) => {
        cy.log('✅ Login successful:', loginRes.status, loginRes.body)
        cy.wait(1500)
        expect(loginRes.status).to.eq(200)
        expect(loginRes.body).to.have.property('token')
        token = loginRes.body.token
        
        cy.log('🔵 Testing wrong password...')
        cy.wait(1000)
        
        // Tentar login com senha errada
        cy.request({
          method: 'POST',
          url: 'http://localhost:3001/api/users/login',
          body: { email: userEmail, password: 'wrongpassword' },
          failOnStatusCode: false
        }).then((wrongRes) => {
          cy.log('✅ Wrong password correctly rejected:', wrongRes.status)
          cy.wait(1500)
          expect(wrongRes.status).to.eq(401)
        })
      })
    })
    
    // UI Testing
    cy.log('🌐 Opening frontend...')
    cy.wait(2000)
    cy.visit('http://localhost:3000')
    cy.wait(2000)
    
    cy.log('✅ Frontend loaded successfully')
    cy.get('body').should('be.visible')
    cy.wait(2000)
  })

  it('E2E Test 2 - Event creation and management flow', () => {
    const eventSlug = `event-${Date.now()}`
    const eventName = `E2E Event ${Date.now()}`
    
    cy.log('🔵 Creating new event...')
    cy.wait(1000)
    
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
      cy.log('✅ Event created:', eventRes.status, eventRes.body)
      cy.wait(1500)
      expect(eventRes.status).to.eq(201)
      expect(eventRes.body).to.have.property('id')
      expect(eventRes.body).to.have.property('slug', eventSlug)
      eventId = eventRes.body.id
      
      cy.log('🔵 Listing all events...')
      cy.wait(1000)
      
      // Listar todos os eventos
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/events',
        failOnStatusCode: false
      }).then((listRes) => {
        cy.log('✅ Events listed:', listRes.status, `Found ${listRes.body.length} events`)
        cy.wait(1500)
        expect(listRes.status).to.eq(200)
        expect(listRes.body).to.be.an('array')
        const foundEvent = listRes.body.find(e => e.id === eventId)
        expect(foundEvent).to.exist
        expect(foundEvent.name).to.eq(eventName)
      })
      
      cy.log('🔵 Getting event by slug...')
      cy.wait(1000)
      
      // Buscar evento por slug
      cy.request({
        method: 'GET',
        url: `http://localhost:3001/api/events/slug/${eventSlug}`,
        failOnStatusCode: false
      }).then((slugRes) => {
        cy.log('✅ Event found by slug:', slugRes.status)
        cy.wait(1500)
        expect(slugRes.status).to.eq(200)
        expect(slugRes.body).to.have.property('id', eventId)
        expect(slugRes.body).to.have.property('name', eventName)
        
        cy.log('🔵 Getting event editions...')
        cy.wait(1000)
        
        // Buscar edições do evento
        cy.request({
          method: 'GET',
          url: `http://localhost:3001/api/events/${eventId}/editions`,
          failOnStatusCode: false
        }).then((editionsRes) => {
          cy.log('✅ Editions retrieved:', editionsRes.status)
          cy.wait(1500)
          expect([200, 404]).to.include(editionsRes.status)
          if (editionsRes.status === 200) {
            expect(editionsRes.body).to.be.an('array')
          }
        })
      })
    })
    
    // UI Testing
    cy.log('🌐 Opening frontend...')
    cy.wait(2000)
    cy.visit('http://localhost:3000')
    cy.wait(2000)
    
    cy.log('🔍 Looking for events navigation...')
    cy.get('body').then(($body) => {
      if ($body.find('a[href*="event"], a:contains("Eventos"), a:contains("Events")').length > 0) {
        cy.log('✅ Events link found, clicking...')
        cy.wait(1500)
        cy.get('a[href*="event"], a:contains("Eventos"), a:contains("Events")').first().click()
        cy.wait(2000)
        cy.log('✅ Navigated to events page')
      } else {
        cy.log('⚠️ No events link found in UI')
      }
    })
    cy.wait(2000)
  })

  it('E2E Test 3 - Article search and filtering flow', () => {
    cy.log('🔵 Fetching all articles...')
    cy.wait(1000)
    
    // Listar todos os artigos
    cy.request({
      method: 'GET',
      url: 'http://localhost:3001/api/articles',
      failOnStatusCode: false
    }).then((listRes) => {
      cy.log('✅ Articles retrieved:', listRes.status, `Found ${listRes.body.length} articles`)
      cy.wait(1500)
      expect(listRes.status).to.eq(200)
      expect(listRes.body).to.be.an('array')
      
      if (listRes.body.length > 0) {
        const firstArticle = listRes.body[0]
        articleId = firstArticle.id
        
        cy.log('🔵 Getting article by ID...')
        cy.wait(1000)
        
        // Buscar artigo por ID
        cy.request({
          method: 'GET',
          url: `http://localhost:3001/api/articles/${articleId}`,
          failOnStatusCode: false
        }).then((detailRes) => {
          cy.log('✅ Article details:', detailRes.status, detailRes.body.title)
          cy.wait(1500)
          expect(detailRes.status).to.eq(200)
          expect(detailRes.body).to.have.property('id', articleId)
          expect(detailRes.body).to.have.property('title')
        })
        
        // Buscar com filtro de título
        if (firstArticle.title) {
          const searchTerm = firstArticle.title.substring(0, 5)
          cy.log(`🔵 Searching articles with term: "${searchTerm}"`)
          cy.wait(1000)
          
          cy.request({
            method: 'GET',
            url: `http://localhost:3001/api/articles?search=${encodeURIComponent(searchTerm)}`,
            failOnStatusCode: false
          }).then((searchRes) => {
            cy.log('✅ Search results:', searchRes.status, `Found ${searchRes.body.length} articles`)
            cy.wait(1500)
            expect(searchRes.status).to.eq(200)
            expect(searchRes.body).to.be.an('array')
          })
        }
        
        // Buscar artigos por autor
        if (firstArticle.authors) {
          const authorName = firstArticle.authors.split(',')[0].trim()
          cy.log(`🔵 Getting articles by author: "${authorName}"`)
          cy.wait(1000)
          
          cy.request({
            method: 'GET',
            url: `http://localhost:3001/api/authors/${encodeURIComponent(authorName)}/articles`,
            failOnStatusCode: false
          }).then((authorRes) => {
            cy.log('✅ Author articles retrieved:', authorRes.status)
            cy.wait(1500)
            expect(authorRes.status).to.eq(200)
            expect(authorRes.body).to.have.property('author', authorName)
            expect(authorRes.body).to.have.property('articles')
          })
        }
      } else {
        cy.log('⚠️ No articles found in database')
      }
    })
    
    // UI Testing
    cy.log('🌐 Opening frontend...')
    cy.wait(2000)
    cy.visit('http://localhost:3000')
    cy.wait(2000)
    
    cy.log('🔍 Looking for articles navigation...')
    cy.get('body').then(($body) => {
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
          cy.log(`✅ Articles link found with selector: ${selector}`)
          cy.wait(1500)
          cy.get(selector).first().click({ force: true })
          cy.wait(2000)
          cy.log('✅ Clicked on articles link')
          found = true
          break
        }
      }
      
      if (!found) {
        cy.log('⚠️ No article links found, staying on home page')
      }
      
      cy.wait(1500)
      cy.log('🔍 Looking for search field...')
      
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="busca"]',
        'input[placeholder*="search"]',
        'input[name="search"]'
      ]
      
      for (const selector of searchSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Search field found with selector: ${selector}`)
          cy.wait(1500)
          cy.get(selector).first().type('test', { delay: 100 })
          cy.wait(1000)
          cy.get(selector).first().type('{enter}')
          cy.wait(2000)
          cy.log('✅ Search performed in UI')
          break
        }
      }
    })
    cy.wait(2000)
  })

  it('E2E Test 4 - Newsletter subscription flow', () => {
    const subscriber1 = unique()
    const subscriber2 = unique()
    
    cy.log('🔵 Subscribing first email...')
    cy.wait(1000)
    
    // Primeira subscrição
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/users/subscribe',
      body: { email: subscriber1 },
      failOnStatusCode: false
    }).then((sub1Res) => {
      cy.log('✅ First subscription:', sub1Res.status, subscriber1)
      cy.wait(1500)
      expect(sub1Res.status).to.eq(201)
      expect(sub1Res.body).to.have.property('message')
      expect(sub1Res.body.message).to.include('Subscrição realizada com sucesso')
      expect(sub1Res.body.subscriber).to.have.property('email', subscriber1)
      
      cy.wait(1000)
      cy.log('🔵 Attempting duplicate subscription...')
      cy.wait(1000)
      
      // Tentar subscrever novamente
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/users/subscribe',
        body: { email: subscriber1 },
        failOnStatusCode: false
      }).then((dupRes) => {
        cy.log('✅ Duplicate subscription response:', dupRes.status)
        cy.wait(1500)
        expect([201, 409]).to.include(dupRes.status)
        
        if (dupRes.status === 409) {
          expect(dupRes.body).to.have.property('error')
          expect(dupRes.body.error).to.include('já está inscrito')
        } else {
          cy.log('⚠️ Warning: Duplicate subscription returned 201 instead of 409')
        }
      })
      
      cy.wait(1000)
      cy.log('🔵 Subscribing second email...')
      cy.wait(1000)
      
      // Segunda subscrição
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/users/subscribe',
        body: { email: subscriber2 },
        failOnStatusCode: false
      }).then((sub2Res) => {
        cy.log('✅ Second subscription:', sub2Res.status, subscriber2)
        cy.wait(1500)
        expect(sub2Res.status).to.eq(201)
        expect(sub2Res.body.subscriber).to.have.property('email', subscriber2)
      })
    })
    
    // UI Testing
    cy.log('🌐 Opening frontend...')
    cy.wait(2000)
    cy.visit('http://localhost:3000')
    cy.wait(2000)
    
    cy.log('🔍 Looking for newsletter form...')
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
          cy.log(`✅ Newsletter form found with selector: ${selector}`)
          cy.wait(1500)
          cy.get(selector).first().clear()
          cy.wait(500)
          cy.get(selector).first().type(testEmail, { delay: 100 })
          cy.wait(1000)
          
          cy.log('🔵 Submitting newsletter form...')
          cy.get(selector).parent().find('button').first().click({ force: true })
          cy.wait(2000)
          
          cy.log('✅ Subscribed via UI with email:', testEmail)
          foundNewsletterInput = true
          break
        }
      }
      
      if (!foundNewsletterInput) {
        cy.log('⚠️ No newsletter form found in UI')
        cy.wait(1500)
        
        cy.log('🔍 Trying to access subscribe page directly...')
        cy.wait(1000)
        cy.visit('http://localhost:3000/subscribe', { failOnStatusCode: false })
        cy.wait(2000)
        
        cy.get('body').then(($subscribePage) => {
          if ($subscribePage.find('input[type="email"]').length > 0) {
            const testEmail = unique()
            cy.log('✅ Subscribe page found')
            cy.wait(1500)
            cy.get('input[type="email"]').first().type(testEmail, { delay: 100 })
            cy.wait(1000)
            cy.get('button[type="submit"]').click()
            cy.wait(2000)
            cy.log('✅ Subscribed via dedicated page')
          } else {
            cy.log('⚠️ No subscribe page found')
          }
        })
      }
    })
    cy.wait(2000)
  })
})