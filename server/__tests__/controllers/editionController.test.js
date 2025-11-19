
// ===========================
// 1. MOCKS DE DEPENDÊNCIAS (ANTES de qualquer import)
// ===========================

const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
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

// ===========================
// 2. IMPORTS
// ===========================

const editionController = require('../../src/controllers/editionController');

// ===========================
// 3. FIXTURES DE TESTE
// ===========================

const mockEdition = {
    id: 1,
    event_id: 1,
    year: 2024,
    name: 'SBRC 2024',
    slug: 'sbrc-2024',
    location: 'Brasília, DF',
    start_date: '2024-05-01',
    end_date: '2024-05-05',
};

const mockEventWithEdition = {
    id: 1,
    name: 'SBRC',
    editions: [
        {
            id: 1,
            year: 2024,
            name: 'SBRC 2024',
            description: 'Simpósio Brasileiro de Redes 2024',
            location: 'Brasília, DF',
            start_date: '2024-05-01',
            end_date: '2024-05-05',
            articles: [],
        },
    ],
};

// ===========================
// 4. SUITE DE TESTES
// ===========================

describe('EditionController - Testes Completos', () => {
    let req, res;

    beforeEach(() => {
        // Limpar todos os mocks
        jest.clearAllMocks();

        // Configurar comportamento chainable do Supabase
        mockSelect.mockReturnThis();
        mockUpdate.mockReturnThis();
        mockDelete.mockReturnThis();
        
        // eq() retorna objeto com select(), single() E outro eq() (para getEditionHomePage)
        mockEq.mockReturnValue({
            select: mockSelect,
            single: mockSingle,
            eq: mockEq, // Para permitir .eq().eq().single()
        });
        
        mockSingle.mockReturnThis();

        // Configurar mockFrom para retornar query builder
        mockFrom.mockReturnValue({
            select: mockSelect,
            update: mockUpdate,
            delete: mockDelete,
            eq: mockEq,
            single: mockSingle,
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
    // TESTES: update()
    // ===========================

    describe('update()', () => {
        beforeEach(() => {
            req.params.id = '1';
        });

        it('deve atualizar edição com sucesso - todos os campos', async () => {
            // ARRANGE
            req.body = {
                year: 2025,
                name: 'SBRC 2025',
                description: 'Nova descrição',
                slug: 'sbrc-2025',
                location: 'São Paulo, SP',
                start_date: '2025-05-01',
                end_date: '2025-05-05',
            };
            const updatedEdition = { ...mockEdition, ...req.body };
            mockSelect.mockResolvedValue({ data: [updatedEdition], error: null });

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('event_editions');
            expect(mockUpdate).toHaveBeenCalledWith(req.body);
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.json).toHaveBeenCalledWith(updatedEdition);
        });

        it('deve atualizar edição com apenas um campo (year)', async () => {
            // ARRANGE
            req.body = { year: 2025 };
            const updatedEdition = { ...mockEdition, year: 2025 };
            mockSelect.mockResolvedValue({ data: [updatedEdition], error: null });

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(mockUpdate).toHaveBeenCalledWith({ year: 2025 });
            expect(res.json).toHaveBeenCalledWith(updatedEdition);
        });

        it('deve atualizar edição com apenas name', async () => {
            // ARRANGE
            req.body = { name: 'Novo Nome' };
            const updatedEdition = { ...mockEdition, name: 'Novo Nome' };
            mockSelect.mockResolvedValue({ data: [updatedEdition], error: null });

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(mockUpdate).toHaveBeenCalledWith({ name: 'Novo Nome' });
            expect(res.json).toHaveBeenCalledWith(updatedEdition);
        });

        it('deve atualizar edição com apenas location', async () => {
            // ARRANGE
            req.body = { location: 'Rio de Janeiro, RJ' };
            const updatedEdition = { ...mockEdition, location: 'Rio de Janeiro, RJ' };
            mockSelect.mockResolvedValue({ data: [updatedEdition], error: null });

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(mockUpdate).toHaveBeenCalledWith({ location: 'Rio de Janeiro, RJ' });
            expect(res.json).toHaveBeenCalledWith(updatedEdition);
        });

        it('deve retornar 400 se nenhum campo válido for fornecido', async () => {
            // ARRANGE
            req.body = {};

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Nenhum campo válido fornecido para atualização.' 
            });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se apenas campos inválidos forem fornecidos', async () => {
            // ARRANGE
            req.body = { invalid_field: 'valor', another_invalid: 123 };

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('deve retornar 404 se edição não for encontrada', async () => {
            // ARRANGE
            req.body = { name: 'Teste' };
            mockSelect.mockResolvedValue({ data: [], error: null });

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Edição não encontrada para o ID fornecido.' 
            });
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            req.body = { name: 'Teste' };
            const dbError = new Error('Database error');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await editionController.update(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: delete()
    // ===========================

    describe('delete()', () => {
        beforeEach(() => {
            req.params.id = '1';
        });

        it('deve deletar edição com sucesso e retornar 204', async () => {
            // ARRANGE
            mockSelect.mockResolvedValue({ data: [mockEdition], error: null });

            // ACT
            await editionController.delete(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('event_editions');
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('deve retornar 404 se edição não for encontrada', async () => {
            // ARRANGE
            mockSelect.mockResolvedValue({ data: [], error: null });

            // ACT
            await editionController.delete(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Edição não encontrada para o ID fornecido.' 
            });
        });

        it('deve retornar 409 se edição tiver artigos vinculados (foreign key)', async () => {
            // ARRANGE
            const fkError = { code: '23503', message: 'Foreign key constraint' };
            mockSelect.mockResolvedValue({ data: null, error: fkError });

            // ACT
            await editionController.delete(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Não é possível excluir a edição porque ela possui artigos vinculados.' 
            });
        });

        it('deve retornar 500 em caso de erro genérico no banco de dados', async () => {
            // ARRANGE
            const dbError = new Error('Database connection failed');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await editionController.delete(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: getEditionHomePage()
    // ===========================

    describe('getEditionHomePage()', () => {
        beforeEach(() => {
            req.params = {
                slug: 'sbrc',
                year: '2024',
            };
        });

        it('deve retornar evento com edição e artigos pelo slug e ano', async () => {
            // ARRANGE
            mockSingle.mockResolvedValue({ data: mockEventWithEdition, error: null });

            // ACT
            await editionController.getEditionHomePage(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('events');
            expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('editions:event_editions'));
            expect(mockEq).toHaveBeenCalledWith('slug', 'sbrc');
            expect(res.json).toHaveBeenCalledWith({
                event: { id: 1, name: 'SBRC' },
                edition: mockEventWithEdition.editions[0],
            });
        });

        it('deve retornar 404 se evento não for encontrado', async () => {
            // ARRANGE
            mockSingle.mockResolvedValue({ data: null, error: null });

            // ACT
            await editionController.getEditionHomePage(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Edição não encontrada' });
        });

        it('deve retornar 404 se edição não tiver editions array', async () => {
            // ARRANGE
            const eventWithoutEditions = { id: 1, name: 'SBRC', editions: undefined };
            mockSingle.mockResolvedValue({ data: eventWithoutEditions, error: null });

            // ACT
            await editionController.getEditionHomePage(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Edição não encontrada' });
        });

        it('deve retornar 404 se editions array estiver vazio', async () => {
            // ARRANGE
            const eventWithEmptyEditions = { id: 1, name: 'SBRC', editions: [] };
            mockSingle.mockResolvedValue({ data: eventWithEmptyEditions, error: null });

            // ACT
            await editionController.getEditionHomePage(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Edição não encontrada' });
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            const dbError = new Error('Database error');
            mockSingle.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await editionController.getEditionHomePage(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });

        it('deve buscar edição de ano diferente', async () => {
            // ARRANGE
            req.params.year = '2023';
            const editionYear2023 = {
                id: 1,
                name: 'SBRC',
                editions: [
                    { id: 2, year: 2023, name: 'SBRC 2023', articles: [] },
                ],
            };
            mockSingle.mockResolvedValue({ data: editionYear2023, error: null });

            // ACT
            await editionController.getEditionHomePage(req, res);

            // ASSERT
            expect(mockEq).toHaveBeenCalledWith('editions.year', '2023');
            expect(res.json).toHaveBeenCalledWith({
                event: { id: 1, name: 'SBRC' },
                edition: editionYear2023.editions[0],
            });
        });

        it('deve buscar edição de slug diferente', async () => {
            // ARRANGE
            req.params.slug = 'sbbd';
            const sbbd = {
                id: 2,
                name: 'SBBD',
                editions: [
                    { id: 3, year: 2024, name: 'SBBD 2024', articles: [] },
                ],
            };
            mockSingle.mockResolvedValue({ data: sbbd, error: null });

            // ACT
            await editionController.getEditionHomePage(req, res);

            // ASSERT
            expect(mockEq).toHaveBeenCalledWith('slug', 'sbbd');
            expect(res.json).toHaveBeenCalledWith({
                event: { id: 2, name: 'SBBD' },
                edition: sbbd.editions[0],
            });
        });
    });
});
