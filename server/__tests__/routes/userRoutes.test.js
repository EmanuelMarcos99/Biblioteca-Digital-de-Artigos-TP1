const express = require('express');
const request = require('supertest');
const userRoutes = require('../../src/routes/userRoutes');
const userController = require('../../src/controllers/userController');

jest.mock('../../src/controllers/userController');

describe('User Routes - Testes de Rotas', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/users', userRoutes);
        jest.clearAllMocks();
    });

    describe('POST /api/users/register', () => {
        it('deve chamar userController.register', async () => {
            userController.register.mockImplementation((req, res) => {
                res.status(201).json({ message: 'User registered' });
            });

            const response = await request(app)
                .post('/api/users/register')
                .send({ email: 'test@test.com', password: 'password123' })
                .expect(201);

            expect(userController.register).toHaveBeenCalled();
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /api/users/login', () => {
        it('deve chamar userController.login', async () => {
            userController.login.mockImplementation((req, res) => {
                res.status(200).json({ token: 'fake-jwt-token' });
            });

            const response = await request(app)
                .post('/api/users/login')
                .send({ email: 'test@test.com', password: 'password123' })
                .expect(200);

            expect(userController.login).toHaveBeenCalled();
            expect(response.body).toHaveProperty('token');
        });
    });

    describe('POST /api/users/subscribe', () => {
        it('deve chamar userController.subscribe', async () => {
            userController.subscribe.mockImplementation((req, res) => {
                res.status(201).json({ message: 'Subscribed successfully' });
            });

            await request(app)
                .post('/api/users/subscribe')
                .send({ email: 'subscriber@test.com' })
                .expect(201);

            expect(userController.subscribe).toHaveBeenCalled();
        });
    });
});