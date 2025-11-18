// ============================================================================
// ARQUIVO DE TESTE - articleRoutes.test.js
// Testes de integração para verificar se as rotas estão configuradas corretamente
// ============================================================================

const express = require('express');
const request = require('supertest');

// Mock dos controllers
jest.mock('../../src/controllers/articleController');
const articleController = require('../../src/controllers/articleController');

// Mock do multer para evitar upload real de arquivos
jest.mock('multer', () => {
    const multer = () => ({
        single: () => (req, res, next) => {
            req.file = { path: '/tmp/test.pdf', originalname: 'test.pdf' };
            next();
        },
    });
    multer.diskStorage = jest.fn();
    return multer;
});

describe('ArticleRoutes - Testes de Integração', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Criar app Express para testes
        app = express();
        app.use(express.json());
        
        // Mockar respostas dos controllers
        articleController.getAll = jest.fn((req, res) => res.json([]));
        articleController.getById = jest.fn((req, res) => res.json({}));
        articleController.create = jest.fn((req, res) => res.status(201).json({}));
        articleController.update = jest.fn((req, res) => res.json({}));
        articleController.delete = jest.fn((req, res) => res.status(204).send());
        articleController.importBibtex = jest.fn((req, res) => res.status(201).json({}));
        
        // Importar e usar as rotas
        const articleRoutes = require('../../src/routes/articleRoutes');
        app.use('/articles', articleRoutes);
    });

    it('deve configurar rota GET / corretamente', async () => {
        await request(app).get('/articles');
        expect(articleController.getAll).toHaveBeenCalled();
    });

    it('deve configurar rota GET /:id corretamente', async () => {
        await request(app).get('/articles/1');
        expect(articleController.getById).toHaveBeenCalled();
    });

    it('deve configurar rota POST /import-pdf corretamente', async () => {
        await request(app).post('/articles/import-pdf');
        expect(articleController.create).toHaveBeenCalled();
    });

    it('deve configurar rota POST /import-bibtex corretamente', async () => {
        await request(app).post('/articles/import-bibtex');
        expect(articleController.importBibtex).toHaveBeenCalled();
    });

    it('deve configurar rota PUT /:id corretamente', async () => {
        await request(app).put('/articles/1').send({});
        expect(articleController.update).toHaveBeenCalled();
    });

    it('deve configurar rota DELETE /:id corretamente', async () => {
        await request(app).delete('/articles/1');
        expect(articleController.delete).toHaveBeenCalled();
    });
});
