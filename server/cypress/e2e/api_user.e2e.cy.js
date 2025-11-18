describe('API End-to-End tests', () => {
  const base = 'http://localhost:3001/api'
  const unique = () => `test${Date.now()}@example.com`
  const password = 'P@ssw0rd!'
  let email
  let token
  let subscriberEmail

  it('1 - Register user (POST /api/users/register) should return 201', () => {
    email = unique()
    cy.request({
      method: 'POST',
      url: `${base}/users/register`,
      body: { name: 'E2E User', email, password },
      failOnStatusCode: false
    }).then((res) => {
      expect([200, 201]).to.include(res.status)
    })
  })

  it('2 - Login user (POST /api/users/login) should return token', () => {
    cy.request({
      method: 'POST',
      url: `${base}/users/login`,
      body: { email, password },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('token')
      token = res.body.token
    })
  })
  it('3 - Subscribe to newsletter (POST /api/users/subscribe) should return 201', () => {
    subscriberEmail = unique()
    
    cy.request({
      method: 'POST',
      url: `${base}/users/subscribe`,
      body: { email: subscriberEmail },
      failOnStatusCode: false
    }).then((res) => {
      cy.log('Subscribe response:', res.status, res.body)
      expect(res.status).to.eq(201)
      expect(res.body).to.have.property('message')
      expect(res.body.message).to.include('Subscrição realizada com sucesso')
      expect(res.body).to.have.property('subscriber')
      expect(res.body.subscriber).to.have.property('email', subscriberEmail)
    })
  })
})