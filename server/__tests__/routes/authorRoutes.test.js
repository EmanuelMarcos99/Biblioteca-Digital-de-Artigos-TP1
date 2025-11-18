const express = require('express');
const request = require('supertest');
const authorRoutes = require('../../src/routes/authorRoutes');
const authorController = require('../../src/controllers/authorController');

jest.mock('../../src/controllers/authorController');

describe('Author Routes - Testes de Rotas', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/authors', authorRoutes);
        jest.clearAllMocks();
    });

    describe('GET /api/authors/:authorName/articles', () => {
        it('deve chamar authorController.getArticlesByAuthor', async () => {
            authorController.getArticlesByAuthor.mockImplementation((req, res) => {
                res.status(200).json({ author: 'João Silva', articles: {} });
            });

            const response = await request(app)
                .get('/api/authors/João Silva/articles')
                .expect(200);

            expect(authorController.getArticlesByAuthor).toHaveBeenCalled();
            expect(response.body).toHaveProperty('author', 'João Silva');
        });

        it('deve lidar com erro do controller', async () => {
            authorController.getArticlesByAuthor.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Internal server error' });
            });

            await request(app)
                .get('/api/authors/Test/articles')
                .expect(500);

            expect(authorController.getArticlesByAuthor).toHaveBeenCalled();
        });
    });
});