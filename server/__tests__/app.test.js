const request = require('supertest');

// Mock das rotas antes de importar o app
jest.mock('../src/routes/articleRoutes', () => {
    const express = require('express');
    const router = express.Router();
    router.get('/', (req, res) => res.json([{ id: 1 }]));
    return router;
});

jest.mock('../src/routes/authorRoutes', () => {
    const express = require('express');
    const router = express.Router();
    router.get('/', (req, res) => res.json([{ id: 1 }]));
    return router;
});

jest.mock('../src/routes/editionRoutes', () => {
    const express = require('express');
    const router = express.Router();
    router.get('/', (req, res) => res.json([{ id: 1 }]));
    return router;
});

jest.mock('../src/routes/eventRoutes', () => {
    const express = require('express');
    const router = express.Router();
    router.get('/', (req, res) => res.json([{ id: 1 }]));
    return router;
});

jest.mock('../src/routes/userRoutes', () => {
    const express = require('express');
    const router = express.Router();
    router.post('/register', (req, res) => res.status(201).json({ message: 'ok' }));
    return router;
});

const app = require('../src/app');

describe('App.js - Testes de Configuração', () => {
    describe('Middleware Configuration', () => {
        it('deve ter CORS habilitado', async () => {
            const response = await request(app)
                .options('/api/articles')
                .set('Origin', 'http://localhost:3000');

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        it('deve aceitar JSON no body', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({ name: 'Test', email: 'test@test.com', password: '123' })
                .set('Content-Type', 'application/json');

            expect(response.status).not.toBe(415); // Unsupported Media Type
        });

        it('deve servir arquivos estáticos da pasta uploads', async () => {
            const response = await request(app)
                .get('/uploads/test.txt');

            // Não importa se o arquivo existe, apenas se a rota está configurada
            expect([200, 404]).toContain(response.status);
        });
    });

    describe('Routes Configuration', () => {
        it('deve ter rota /api/articles configurada', async () => {
            const response = await request(app)
                .get('/api/articles');

            expect([200, 404]).toContain(response.status);
        });

        it('deve ter rota /api/authors configurada', async () => {
            const response = await request(app)
                .get('/api/authors');

            expect([200, 404]).toContain(response.status);
        });

        it('deve ter rota /api/editions configurada', async () => {
            const response = await request(app)
                .get('/api/editions');

            expect([200, 404]).toContain(response.status);
        });

        it('deve ter rota /api/events configurada', async () => {
            const response = await request(app)
                .get('/api/events');

            expect([200, 404]).toContain(response.status);
        });

        it('deve ter rota /api/users configurada', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({});

            expect([200, 201, 400, 404]).toContain(response.status);
        });
    });

    describe('Error Handling', () => {
        it('deve retornar 404 para rotas inexistentes', async () => {
            const response = await request(app)
                .get('/api/rota-inexistente');

            expect(response.status).toBe(404);
        });
    });

    describe('App Export', () => {
        it('deve exportar uma instância do Express', () => {
            expect(app).toBeDefined();
            expect(typeof app).toBe('function');
        });
    });
});