// ============================================================================// ============================================================================

// ===========================
// 1. MOCKS DE DEPENDÊNCIAS (ANTES de qualquer import)
// ===========================

// Criar mocks reutilizáveis
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockFrom = jest.fn();

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: mockFrom,
    })),
}));

// Mock do dotenv
jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

// Mock do console.error para não poluir os logs
global.console.error = jest.fn();

// ===========================
// 2. IMPORTS
// ===========================

const eventController = require('../../src/controllers/eventController');

// ===========================
// 3. FIXTURES DE TESTE
// ===========================

const mockEvent = {
    id: 1,
    name: 'SBRC 2024',
    description: 'Simpósio Brasileiro de Redes de Computadores',
    slug: 'sbrc-2024',
};

const mockEvents = [
    { id: 1, name: 'SBRC 2024', slug: 'sbrc-2024', editions: [] },
    { id: 2, name: 'SBBD 2024', slug: 'sbbd-2024', editions: [] },
];

const mockEdition = {
    id: 1,
    event_id: 1,
    year: 2024,
    name: 'SBRC 2024',
    slug: 'sbrc-2024',
    location: 'Brasília, DF',
};

// ===========================
// 4. SUITE DE TESTES
// ===========================

describe('EventController - Testes Completos', () => {
    let req, res;

    beforeEach(() => {
        // Limpar todos os mocks
        jest.clearAllMocks();

        // Configurar comportamento chainable do Supabase
        mockSelect.mockReturnThis();
        mockInsert.mockReturnThis();
        mockUpdate.mockReturnThis();
        mockDelete.mockReturnThis();
        mockOrder.mockReturnThis();
        
        // eq() retorna objeto com single(), select() e order()
        mockEq.mockReturnValue({
            single: mockSingle,
            select: mockSelect,
            order: mockOrder,
        });
        
        mockSingle.mockReturnThis();

        // Configurar mockFrom para retornar query builder
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
            eq: mockEq,
            single: mockSingle,
            order: mockOrder,
        });

        // Configurar req e res
        req = {
            params: {},
            body: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    // ===========================
    // TESTES: getAll()
    // ===========================

    describe('getAll()', () => {
        it('deve retornar todos os eventos com suas edições', async () => {
            // ARRANGE
            mockSelect.mockResolvedValue({ data: mockEvents, error: null });

            // ACT
            await eventController.getAll(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('events');
            expect(mockSelect).toHaveBeenCalledWith('*, editions:event_editions(*)');
            expect(res.json).toHaveBeenCalledWith(mockEvents);
        });

        it('deve retornar erro 500 em caso de falha no banco de dados', async () => {
            // ARRANGE
            const dbError = new Error('Database connection error');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await eventController.getAll(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: getById()
    // ===========================

    describe('getById()', () => {
        it('deve retornar um evento pelo ID', async () => {
            // ARRANGE
            req.params.id = '1';
            mockSingle.mockResolvedValue({ data: mockEvent, error: null });

            // ACT
            await eventController.getById(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('events');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.json).toHaveBeenCalledWith(mockEvent);
        });

        it('deve retornar 404 se evento não for encontrado', async () => {
            // ARRANGE
            req.params.id = '999';
            mockSingle.mockResolvedValue({ data: null, error: null });

            // ACT
            await eventController.getById(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Evento não encontrado.' });
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            req.params.id = '1';
            const dbError = new Error('Database error');
            mockSingle.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await eventController.getById(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: create() - ATENÇÃO: SEGUNDA FUNÇÃO (com email)
    // A segunda função create() sobrescreve a primeira no module.exports
    // ===========================

    describe('create() - Segunda versão (com notificação de email)', () => {
        beforeEach(() => {
            req.body = {
                name: 'SBRC 2025',
                description: 'Simpósio Brasileiro de Redes 2025',
                slug: 'sbrc-2025',
            };
        });

        it('deve criar evento com sucesso', async () => {
            // ARRANGE
            const newEvent = { id: 3, name: 'SBRC 2025', slug: 'sbrc-2025' };
            
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({ data: [newEvent], error: null }),
            };
            mockInsert.mockReturnValueOnce(mockInsertChain);
            
            // Mock para subscribers retornar vazio (não dispara email)
            mockSelect.mockResolvedValueOnce({ data: [], error: null });

            // ACT
            await eventController.create(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newEvent);
        });

        it('deve retornar 400 se name não for fornecido', async () => {
            // ARRANGE
            delete req.body.name;

            // ACT
            await eventController.create(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Nome e slug do evento são obrigatórios.' 
            });
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se slug não for fornecido', async () => {
            // ARRANGE
            delete req.body.slug;

            // ACT
            await eventController.create(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('deve retornar 409 se slug já estiver em uso', async () => {
            // ARRANGE
            const duplicateError = { code: '23505', message: 'Duplicate key' };
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({ data: null, error: duplicateError }),
            };
            mockInsert.mockReturnValueOnce(mockInsertChain);

            // ACT
            await eventController.create(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'O slug fornecido já está em uso.' 
            });
        });

        it('deve criar evento mesmo se busca de subscribers falhar', async () => {
            // ARRANGE
            const newEvent = { id: 3, name: 'SBRC 2025', slug: 'sbrc-2025' };
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({ data: [newEvent], error: null }),
            };
            mockInsert.mockReturnValueOnce(mockInsertChain);
            
            const subError = new Error('Erro ao buscar subscribers');
            mockSelect.mockResolvedValueOnce({ data: null, error: subError });

            // ACT
            await eventController.create(req, res);

            // ASSERT
            expect(console.error).toHaveBeenCalledWith(
                'Erro ao buscar inscritos para email:',
                subError.message
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newEvent);
        });

        it('não deve enviar email se não houver subscribers', async () => {
            // ARRANGE
            const newEvent = { id: 3, name: 'SBRC 2025', slug: 'sbrc-2025' };
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({ data: [newEvent], error: null }),
            };
            mockInsert.mockReturnValueOnce(mockInsertChain);
            mockSelect.mockResolvedValueOnce({ data: [], error: null });

            // ACT
            await eventController.create(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newEvent);
        });

        it('deve retornar 500 se houver erro ao criar evento', async () => {
            // ARRANGE
            const dbError = new Error('Database error');
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({ data: null, error: dbError }),
            };
            mockInsert.mockReturnValueOnce(mockInsertChain);

            // ACT
            await eventController.create(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: update()
    // ===========================

    describe('update()', () => {
        beforeEach(() => {
            req.params.id = '1';
        });

        it('deve atualizar evento com sucesso', async () => {
            // ARRANGE
            req.body = { name: 'SBRC 2024 Atualizado' };
            const updatedEvent = { ...mockEvent, name: 'SBRC 2024 Atualizado' };
            mockSelect.mockResolvedValue({ data: [updatedEvent], error: null });

            // ACT
            await eventController.update(req, res);

            // ASSERT
            expect(mockUpdate).toHaveBeenCalledWith({
                name: 'SBRC 2024 Atualizado',
                description: undefined,
                slug: undefined,
            });
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.json).toHaveBeenCalledWith(updatedEvent);
        });

        it('deve retornar 400 se nenhum campo for fornecido', async () => {
            // ARRANGE
            req.body = {};

            // ACT
            await eventController.update(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Nenhum campo fornecido para atualização.' 
            });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('deve retornar 404 se evento não for encontrado', async () => {
            // ARRANGE
            req.body = { name: 'Teste' };
            mockSelect.mockResolvedValue({ data: [], error: null });

            // ACT
            await eventController.update(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Evento não encontrado para o ID fornecido.' 
            });
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            req.body = { name: 'Teste' };
            const dbError = new Error('Database error');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await eventController.update(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: delete()
    // ===========================

    describe('delete()', () => {
        it('deve deletar evento com sucesso e retornar 204', async () => {
            // ARRANGE
            req.params.id = '1';
            mockSelect.mockResolvedValue({ data: [mockEvent], error: null });

            // ACT
            await eventController.delete(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('events');
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('deve retornar 404 se evento não for encontrado', async () => {
            // ARRANGE
            req.params.id = '999';
            mockSelect.mockResolvedValue({ data: [], error: null });

            // ACT
            await eventController.delete(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Evento não encontrado para o ID fornecido.' 
            });
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            req.params.id = '1';
            const dbError = new Error('Foreign key constraint');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await eventController.delete(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: getEventHomePage()
    // ===========================

    describe('getEventHomePage()', () => {
        it('deve retornar evento com edições pelo slug', async () => {
            // ARRANGE
            req.params.slug = 'sbrc-2024';
            const eventWithEditions = { ...mockEvent, editions: [mockEdition] };
            mockSingle.mockResolvedValue({ data: eventWithEditions, error: null });

            // ACT
            await eventController.getEventHomePage(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('events');
            expect(mockSelect).toHaveBeenCalledWith('*, editions:event_editions(*)');
            expect(mockEq).toHaveBeenCalledWith('slug', 'sbrc-2024');
            expect(res.json).toHaveBeenCalledWith(eventWithEditions);
        });

        it('deve retornar 404 se evento não for encontrado pelo slug', async () => {
            // ARRANGE
            req.params.slug = 'evento-inexistente';
            mockSingle.mockResolvedValue({ data: null, error: null });

            // ACT
            await eventController.getEventHomePage(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Evento não encontrado' });
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            req.params.slug = 'sbrc-2024';
            const dbError = new Error('Database error');
            mockSingle.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await eventController.getEventHomePage(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: createEdition()
    // ===========================

    describe('createEdition()', () => {
        beforeEach(() => {
            req.params.eventId = '1';
            req.body = {
                year: 2024,
                name: 'SBRC 2024',
                slug: 'sbrc-2024',
                location: 'Brasília, DF',
            };
        });

        it('deve criar edição com sucesso e retornar 201', async () => {
            // ARRANGE
            mockSelect.mockResolvedValue({ data: [mockEdition], error: null });

            // ACT
            await eventController.createEdition(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('event_editions');
            expect(mockInsert).toHaveBeenCalledWith([{
                event_id: '1',
                year: 2024,
                location: 'Brasília, DF',
                name: 'SBRC 2024',
                slug: 'sbrc-2024',
            }]);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockEdition);
        });

        it('deve retornar 400 se year não for fornecido', async () => {
            // ARRANGE
            delete req.body.year;

            // ACT
            await eventController.createEdition(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Ano, Nome e Slug da edição são obrigatórios.' 
            });
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se name não for fornecido', async () => {
            // ARRANGE
            delete req.body.name;

            // ACT
            await eventController.createEdition(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se slug não for fornecido', async () => {
            // ARRANGE
            delete req.body.slug;

            // ACT
            await eventController.createEdition(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('deve retornar 404 se evento não existir (foreign key)', async () => {
            // ARRANGE
            const fkError = { code: '23503', message: 'Foreign key violation' };
            mockSelect.mockResolvedValue({ data: null, error: fkError });

            // ACT
            await eventController.createEdition(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Evento com ID 1 não encontrado.' 
            });
        });

        it('deve retornar 409 se slug já estiver em uso', async () => {
            // ARRANGE
            const duplicateError = { code: '23505', message: 'Duplicate key' };
            mockSelect.mockResolvedValue({ data: null, error: duplicateError });

            // ACT
            await eventController.createEdition(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'O slug para esta edição já está em uso.' 
            });
        });

        it('deve retornar 500 em caso de erro genérico no banco', async () => {
            // ARRANGE
            const dbError = new Error('Generic database error');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await eventController.createEdition(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: getAllEditions()
    // ===========================

    describe('getAllEditions()', () => {
        it('deve retornar todas as edições de um evento ordenadas por ano', async () => {
            // ARRANGE
            req.params.eventId = '1';
            const editions = [
                { id: 1, event_id: 1, year: 2024, name: 'SBRC 2024' },
                { id: 2, event_id: 1, year: 2023, name: 'SBRC 2023' },
            ];
            mockOrder.mockResolvedValue({ data: editions, error: null });

            // ACT
            await eventController.getAllEditions(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('event_editions');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockEq).toHaveBeenCalledWith('event_id', '1');
            expect(mockOrder).toHaveBeenCalledWith('year', { ascending: false });
            expect(res.json).toHaveBeenCalledWith(editions);
        });

        it('deve retornar array vazio se evento não tiver edições', async () => {
            // ARRANGE
            req.params.eventId = '999';
            mockOrder.mockResolvedValue({ data: [], error: null });

            // ACT
            await eventController.getAllEditions(req, res);

            // ASSERT
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            req.params.eventId = '1';
            const dbError = new Error('Database error');
            mockOrder.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await eventController.getAllEditions(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });
});
