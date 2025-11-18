const express = require('express');
const request = require('supertest');
const eventRoutes = require('../../src/routes/eventRoutes');
const eventController = require('../../src/controllers/eventController');

jest.mock('../../src/controllers/eventController');

describe('Event Routes - Testes de Rotas', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/events', eventRoutes);
        jest.clearAllMocks();
    });

    describe('POST /api/events', () => {
        it('deve chamar eventController.create', async () => {
            eventController.create.mockImplementation((req, res) => {
                res.status(201).json({ id: 1, name: 'Test Event' });
            });

            const response = await request(app)
                .post('/api/events')
                .send({ name: 'Test Event', slug: 'test-event' })
                .expect(201);

            expect(eventController.create).toHaveBeenCalled();
            expect(response.body).toHaveProperty('name', 'Test Event');
        });
    });

    describe('GET /api/events', () => {
        it('deve chamar eventController.getAll', async () => {
            eventController.getAll.mockImplementation((req, res) => {
                res.status(200).json([{ id: 1, name: 'Event 1' }]);
            });

            await request(app)
                .get('/api/events')
                .expect(200);

            expect(eventController.getAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/events/:id', () => {
        it('deve chamar eventController.getById', async () => {
            eventController.getById.mockImplementation((req, res) => {
                res.status(200).json({ id: 1, name: 'Event 1' });
            });

            await request(app)
                .get('/api/events/1')
                .expect(200);

            expect(eventController.getById).toHaveBeenCalled();
        });
    });

    describe('GET /api/events/slug/:slug', () => {
        it('deve chamar eventController.getBySlug', async () => {
            eventController.getBySlug.mockImplementation((req, res) => {
                res.status(200).json({ id: 1, slug: 'test-event' });
            });

            await request(app)
                .get('/api/events/slug/test-event')
                .expect(200);

            expect(eventController.getBySlug).toHaveBeenCalled();
        });
    });

    describe('GET /api/events/:id/editions', () => {
        it('deve chamar eventController.getEditions', async () => {
            eventController.getEditions.mockImplementation((req, res) => {
                res.status(200).json([{ id: 1, year: 2024 }]);
            });

            await request(app)
                .get('/api/events/1/editions')
                .expect(200);

            expect(eventController.getEditions).toHaveBeenCalled();
        });
    });
});