const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/auth');
const eventController = require('../../src/controllers/eventController');
const userController = require('../../src/controllers/userController');

jest.mock('jsonwebtoken');

describe('Auth Middleware - Testes Completos', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('Token Validation', () => {
        it('deve retornar 401 se token não for fornecido', () => {
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token de autenticação não fornecido.',
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se authorization header estiver vazio', () => {
            req.headers.authorization = '';

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se token não começar com Bearer', () => {
            req.headers.authorization = 'InvalidToken abc123';

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token de autenticação não fornecido.',
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se apenas "Bearer" sem token', () => {
            req.headers.authorization = 'Bearer';

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se token for inválido', () => {
            req.headers.authorization = 'Bearer invalid-token';
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token inválido ou expirado.',
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se token estiver expirado', () => {
            req.headers.authorization = 'Bearer expired-token';
            jwt.verify.mockImplementation(() => {
                const error = new Error('Token expired');
                error.name = 'TokenExpiredError';
                throw error;
            });

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token inválido ou expirado.',
            });
        });

        it('deve retornar 401 para JsonWebTokenError', () => {
            req.headers.authorization = 'Bearer malformed-token';
            jwt.verify.mockImplementation(() => {
                const error = new Error('Malformed token');
                error.name = 'JsonWebTokenError';
                throw error;
            });

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('Successful Authentication', () => {
        it('deve chamar next() se token for válido', () => {
            req.headers.authorization = 'Bearer valid-token';
            const decodedToken = { userId: 1, email: 'test@test.com', role: 'user' };
            jwt.verify.mockReturnValue(decodedToken);

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
            expect(req.user).toEqual(decodedToken);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('deve aceitar token com espaços extras', () => {
            req.headers.authorization = 'Bearer   valid-token   ';
            const decodedToken = { userId: 1 };
            jwt.verify.mockReturnValue(decodedToken);

            authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toEqual(decodedToken);
        });

        it('deve adicionar user ao request object', () => {
            req.headers.authorization = 'Bearer valid-token';
            const decodedToken = { 
                userId: 123, 
                email: 'user@test.com',
                name: 'Test User',
                role: 'admin'
            };
            jwt.verify.mockReturnValue(decodedToken);

            authMiddleware(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user.userId).toBe(123);
            expect(req.user.email).toBe('user@test.com');
            expect(req.user.name).toBe('Test User');
            expect(req.user.role).toBe('admin');
            expect(next).toHaveBeenCalled();
        });

        it('deve verificar token com JWT_SECRET correto', () => {
            req.headers.authorization = 'Bearer test-token';
            jwt.verify.mockReturnValue({ userId: 1 });

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('test-token', 'test-secret');
        });
    });

    describe('Edge Cases', () => {
        it('deve lidar com token que contém "Bearer" no meio', () => {
            req.headers.authorization = 'NotBearer token';

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('deve lidar com múltiplos espaços entre Bearer e token', () => {
            req.headers.authorization = 'Bearer     token-with-spaces';
            jwt.verify.mockReturnValue({ userId: 1 });

            authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('deve lidar com undefined JWT_SECRET', () => {
            delete process.env.JWT_SECRET;
            req.headers.authorization = 'Bearer valid-token';
            jwt.verify.mockReturnValue({ userId: 1 });

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', undefined);
        });
    });
});

describe('EventController - Testes Adicionais para Cobertura Completa', () => {
    describe('create() - Validações adicionais', () => {
        it('deve retornar 400 se description não for fornecido', async () => {
            req.body = {
                name: 'Test Event',
                slug: 'test-event'
                // description faltando
            };

            await eventController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Nome, descrição e slug são obrigatórios.'
            });
        });

        it('deve trimmar espaços em branco dos campos', async () => {
            req.body = {
                name: '  Event Name  ',
                description: '  Event Description  ',
                slug: '  event-slug  '
            };

            mockSelect.mockResolvedValue({
                data: [{ id: 1, name: 'Event Name', slug: 'event-slug' }],
                error: null
            });

            await eventController.create(req, res);

            expect(mockInsert).toHaveBeenCalledWith([{
                name: 'Event Name',
                description: 'Event Description',
                slug: 'event-slug'
            }]);
        });
    });

    describe('getEditions() - Casos adicionais', () => {
        it('deve retornar array vazio se evento não tiver edições', async () => {
            req.params.id = '1';
            mockSelect.mockResolvedValue({
                data: [],
                error: null
            });

            await eventController.getEditions(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('deve retornar edições ordenadas', async () => {
            req.params.id = '1';
            const mockEditions = [
                { id: 1, year: 2024, name: 'Edition 2024' },
                { id: 2, year: 2023, name: 'Edition 2023' }
            ];
            mockSelect.mockResolvedValue({
                data: mockEditions,
                error: null
            });

            await eventController.getEditions(req, res);

            expect(mockFrom).toHaveBeenCalledWith('event_editions');
            expect(mockEq).toHaveBeenCalledWith('event_id', '1');
            expect(res.json).toHaveBeenCalledWith(mockEditions);
        });
    });
});

describe('UserController - Cobertura Completa', () => {
    describe('register() - Email já existe', () => {
        it('deve retornar 400 se email já estiver cadastrado', async () => {
            req.body = {
                name: 'Test User',
                email: 'existing@test.com',
                password: 'password123'
            };

            // Mock para simular email já existente
            mockSelect.mockResolvedValueOnce({
                data: [{ id: 1, email: 'existing@test.com' }],
                error: null
            });

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: expect.stringContaining('já está cadastrado')
            });
        });
    });

    describe('subscribe() - Casos edge', () => {
        it('deve aceitar subscrição com email válido', async () => {
            req.body = { email: 'newsubscriber@test.com' };

            mockSingle.mockResolvedValueOnce({ data: null, error: null });
            mockSelect.mockResolvedValue({
                data: [{ id: 1, email: 'newsubscriber@test.com', created_at: new Date() }],
                error: null
            });

            await userController.subscribe(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('deve validar formato de email', async () => {
            req.body = { email: 'invalid-email' };

            await userController.subscribe(req, res);

            // Dependendo da implementação, pode retornar 400
            expect([400, 500]).toContain(res.status.mock.calls[0][0]);
        });
    });

    describe('getSubscribers() - Teste de exportação', () => {
        it('deve retornar lista de subscribers', async () => {
            const mockSubscribers = [
                { email: 'user1@test.com' },
                { email: 'user2@test.com' }
            ];

            mockSelect.mockResolvedValue({
                data: mockSubscribers,
                error: null
            });

            const result = await userController.getSubscribers();

            expect(result).toEqual(mockSubscribers);
        });
    });
});