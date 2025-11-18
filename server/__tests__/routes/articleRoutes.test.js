const express = require('express');
const request = require('supertest');
const articleRoutes = require('../../src/routes/articleRoutes');
const articleController = require('../../src/controllers/articleController');
const multer = require('multer');

jest.mock('../../src/controllers/articleController');
jest.mock('multer');

describe('Article Routes - Testes Completos', () => {
    let app;
    let mockUpload;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        
        // Mock do multer
        mockUpload = {
            single: jest.fn(() => (req, res, next) => {
                req.file = { path: '/tmp/test.pdf', filename: 'test.pdf' };
                next();
            }),
        };
        multer.mockReturnValue(mockUpload);
        multer.diskStorage = jest.fn();
        
        app.use('/api/articles', articleRoutes);
        jest.clearAllMocks();
    });

    describe('GET /api/articles', () => {
        it('deve chamar articleController.getAll', async () => {
            articleController.getAll.mockImplementation((req, res) => {
                res.status(200).json([{ id: 1, title: 'Article 1' }]);
            });

            const response = await request(app)
                .get('/api/articles')
                .expect(200);

            expect(articleController.getAll).toHaveBeenCalled();
            expect(response.body).toEqual([{ id: 1, title: 'Article 1' }]);
        });

        it('deve passar query parameters para o controller', async () => {
            articleController.getAll.mockImplementation((req, res) => {
                res.status(200).json([]);
            });

            await request(app)
                .get('/api/articles?search=test')
                .expect(200);

            expect(articleController.getAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/articles/:id', () => {
        it('deve chamar articleController.getById', async () => {
            articleController.getById.mockImplementation((req, res) => {
                res.status(200).json({ id: 1, title: 'Article 1' });
            });

            await request(app)
                .get('/api/articles/1')
                .expect(200);

            expect(articleController.getById).toHaveBeenCalled();
        });

        it('deve retornar 404 para artigo inexistente', async () => {
            articleController.getById.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Artigo não encontrado.' });
            });

            await request(app)
                .get('/api/articles/999')
                .expect(404);

            expect(articleController.getById).toHaveBeenCalled();
        });
    });

    describe('POST /api/articles', () => {
        it('deve chamar articleController.create com upload', async () => {
            articleController.create.mockImplementation((req, res) => {
                res.status(201).json({ id: 1, title: 'New Article' });
            });

            const response = await request(app)
                .post('/api/articles')
                .field('title', 'New Article')
                .field('authors', 'John Doe')
                .field('abstract', 'Abstract text')
                .field('edition_id', '1')
                .expect(201);

            expect(articleController.create).toHaveBeenCalled();
            expect(response.body).toHaveProperty('id');
        });

        it('deve aceitar arquivo PDF via multipart/form-data', async () => {
            articleController.create.mockImplementation((req, res) => {
                res.status(201).json({ id: 1 });
            });

            await request(app)
                .post('/api/articles')
                .field('title', 'Test')
                .field('authors', 'Author')
                .field('abstract', 'Abstract')
                .field('edition_id', '1')
                .expect(201);

            expect(mockUpload.single).toHaveBeenCalledWith('pdf');
        });
    });

    describe('PUT /api/articles/:id', () => {
        it('deve chamar articleController.update', async () => {
            articleController.update.mockImplementation((req, res) => {
                res.status(200).json({ id: 1, title: 'Updated Title' });
            });

            await request(app)
                .put('/api/articles/1')
                .send({ title: 'Updated Title' })
                .expect(200);

            expect(articleController.update).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/articles/:id', () => {
        it('deve chamar articleController.delete', async () => {
            articleController.delete.mockImplementation((req, res) => {
                res.status(204).send();
            });

            await request(app)
                .delete('/api/articles/1')
                .expect(204);

            expect(articleController.delete).toHaveBeenCalled();
        });
    });

    describe('POST /api/articles/import-bibtex', () => {
        it('deve chamar articleController.importBibtex', async () => {
            articleController.importBibtex.mockImplementation((req, res) => {
                res.status(200).json({ message: 'Importação concluída' });
            });

            await request(app)
                .post('/api/articles/import-bibtex')
                .field('edition_id', '1')
                .expect(200);

            expect(articleController.importBibtex).toHaveBeenCalled();
            expect(mockUpload.single).toHaveBeenCalledWith('bibtex');
        });

        it('deve processar arquivo .bib via upload', async () => {
            articleController.importBibtex.mockImplementation((req, res) => {
                res.status(200).json({ 
                    message: 'Importação concluída. 5 artigos criados.',
                    articles_created: []
                });
            });

            const response = await request(app)
                .post('/api/articles/import-bibtex')
                .field('edition_id', '1')
                .expect(200);

            expect(response.body).toHaveProperty('message');
        });
    });
});