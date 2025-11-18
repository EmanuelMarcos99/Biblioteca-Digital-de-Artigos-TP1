const express = require('express');
const request = require('supertest');
const editionRoutes = require('../../src/routes/editionRoutes');
const editionController = require('../../src/controllers/editionController');

jest.mock('../../src/controllers/editionController');

describe('Edition Routes - Testes de Rotas', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/editions', editionRoutes);
        jest.clearAllMocks();
    });

    describe('POST /api/editions', () => {
        it('deve chamar editionController.create', async () => {
            editionController.create.mockImplementation((req, res) => {
                res.status(201).json({ id: 1, name: 'Edition 2024' });
            });

            const response = await request(app)
                .post('/api/editions')
                .send({ name: 'Edition 2024', year: 2024 })
                .expect(201);

            expect(editionController.create).toHaveBeenCalled();
            expect(response.body).toHaveProperty('id', 1);
        });
    });

    describe('GET /api/editions/:id', () => {
        it('deve chamar editionController.getById', async () => {
            editionController.getById.mockImplementation((req, res) => {
                res.status(200).json({ id: 1, name: 'Edition 2024' });
            });

            await request(app)
                .get('/api/editions/1')
                .expect(200);

            expect(editionController.getById).toHaveBeenCalled();
        });
    });
});