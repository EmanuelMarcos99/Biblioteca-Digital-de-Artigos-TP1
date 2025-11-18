// ============================================================================
// ARQUIVO DE TESTE COMPLETO - userController.test.js
// Engenheiro de QA Sênior - Padrão AAA (Arrange, Act, Assert)
// Objetivo: Atingir 70%+ de cobertura sem modificar o código-fonte
// PRIORIDADE: ALTA - Segurança Crítica (JWT, bcrypt, autenticação)
// ============================================================================

// ===========================
// 1. MOCKS DE DEPENDÊNCIAS (ANTES de qualquer import)
// ===========================

// Criar mocks reutilizáveis
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpsert = jest.fn();
const mockFrom = jest.fn();

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: mockFrom,
    })),
}));

// Mock do bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

// Mock do jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

// Mock do nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(),
}));

// Mock do console.error para não poluir os logs durante testes
global.console.error = jest.fn();

// ===========================
// 2. IMPORTS
// ===========================

const userController = require('../../src/controllers/userController');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ===========================
// 3. FIXTURES DE TESTE
// ===========================

const mockUser = {
    id: 1,
    name: 'João Silva',
    email: 'joao@test.com',
    password: '$2b$10$hashedPasswordExample',
    created_at: new Date('2024-01-01'),
};

const mockUserWithoutPassword = {
    id: 1,
    name: 'João Silva',
    email: 'joao@test.com',
};

const mockSubscriber = {
    email: 'subscriber@test.com',
    subscribed_at: new Date(),
};

// ===========================
// 4. SUITE DE TESTES
// ===========================

describe('UserController - Testes Completos', () => {
    let req, res;

    beforeEach(() => {
        // Limpar todos os mocks
        jest.clearAllMocks();

        // Configurar comportamento chainable do Supabase
        mockSelect.mockReturnThis();
        mockInsert.mockReturnThis();
        mockUpdate.mockReturnThis();
        mockUpsert.mockReturnThis();
        
        // eq() retorna um objeto com single() que é o final
        mockEq.mockReturnValue({
            single: mockSingle,
            select: mockSelect, // Para casos de update/delete que usam eq().select()
        });
        
        // single() é sempre o final da chain
        mockSingle.mockReturnThis();

        // Configurar mockFrom para retornar query builder
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            eq: mockEq,
            single: mockSingle,
            upsert: mockUpsert,
        });

        // Configurar req e res
        req = {
            body: {},
            user: null,
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    // ===========================
    // TESTES: register()
    // ===========================

    describe('register()', () => {
        beforeEach(() => {
            req.body = {
                name: 'Novo Usuário',
                email: 'novo@test.com',
                password: 'senhaSegura123',
            };
        });

        it('deve criar um novo usuário com senha hasheada e retornar 201', async () => {
            // ARRANGE
            const hashedPassword = '$2b$10$hashedPasswordNew';
            bcrypt.hash.mockResolvedValue(hashedPassword);
            
            // Primeira chamada: verificar se usuário existe (não existe)
            // O .single() é o final da chain e retorna a Promise
            mockSingle.mockResolvedValueOnce({ data: null, error: null });
            
            // Segunda chamada: inserir novo usuário
            // O .select() é o final da chain após .insert()
            mockSelect.mockResolvedValueOnce({ 
                data: [{ id: 2, name: 'Novo Usuário', email: 'novo@test.com' }], 
                error: null 
            });

            // ACT
            await userController.register(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('users');
            expect(mockSelect).toHaveBeenCalledWith('id');
            expect(mockEq).toHaveBeenCalledWith('email', 'novo@test.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('senhaSegura123', 10);
            expect(mockInsert).toHaveBeenCalledWith([{
                name: 'Novo Usuário',
                email: 'novo@test.com',
                password: hashedPassword,
            }]);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuário criado com sucesso',
                user: { id: 2, name: 'Novo Usuário', email: 'novo@test.com' },
            });
        });

        it('deve retornar 400 se usuário já existir', async () => {
            // ARRANGE
            mockSingle.mockResolvedValue({ data: { id: 1 }, error: null });

            // ACT
            await userController.register(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário já existe' });
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('deve retornar 500 se houver erro ao gerar hash da senha', async () => {
            // ARRANGE
            mockSingle.mockResolvedValueOnce({ data: null, error: null });
            const bcryptError = new Error('Erro no bcrypt');
            bcrypt.hash.mockRejectedValue(bcryptError);

            // ACT
            await userController.register(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: bcryptError.message });
        });

        it('deve retornar 500 se houver erro ao inserir no banco de dados', async () => {
            // ARRANGE
            mockSingle.mockResolvedValueOnce({ data: null, error: null });
            bcrypt.hash.mockResolvedValue('$2b$10$hashed');
            
            const dbError = new Error('Erro de constraint');
            mockSelect.mockResolvedValueOnce({ data: null, error: dbError });

            // ACT
            await userController.register(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: login()
    // ===========================

    describe('login()', () => {
        beforeEach(() => {
            req.body = {
                email: 'joao@test.com',
                password: 'senhaCorreta123',
            };
        });

        it('deve fazer login com credenciais válidas e retornar token JWT', async () => {
            // ARRANGE
            mockSingle.mockResolvedValue({ data: mockUser, error: null });
            bcrypt.compare.mockResolvedValue(true);
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockToken';
            jwt.sign.mockReturnValue(mockToken);

            // ACT
            await userController.login(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('users');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockEq).toHaveBeenCalledWith('email', 'joao@test.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('senhaCorreta123', mockUser.password);
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: mockUser.id }, 
                process.env.JWT_SECRET
            );
            expect(res.json).toHaveBeenCalledWith({
                token: mockToken,
                user: { id: 1, name: 'João Silva', email: 'joao@test.com' },
            });
        });

        it('deve retornar 401 se usuário não for encontrado', async () => {
            // ARRANGE
            mockSingle.mockResolvedValue({ data: null, error: null });

            // ACT
            await userController.login(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se houver erro ao buscar usuário no banco', async () => {
            // ARRANGE
            const dbError = new Error('Database error');
            mockSingle.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await userController.login(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('deve retornar 401 se senha for inválida', async () => {
            // ARRANGE
            mockSingle.mockResolvedValue({ data: mockUser, error: null });
            bcrypt.compare.mockResolvedValue(false);

            // ACT
            await userController.login(req, res);

            // ASSERT
            expect(bcrypt.compare).toHaveBeenCalledWith('senhaCorreta123', mockUser.password);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Senha inválida' });
            expect(jwt.sign).not.toHaveBeenCalled();
        });

        it('deve retornar 500 se houver erro ao comparar senhas com bcrypt', async () => {
            // ARRANGE
            mockSingle.mockResolvedValue({ data: mockUser, error: null });
            const bcryptError = new Error('Erro no bcrypt.compare');
            bcrypt.compare.mockRejectedValue(bcryptError);

            // ACT
            await userController.login(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: bcryptError.message });
        });
    });

    // ===========================
    // TESTES: getProfile()
    // ===========================

    describe('getProfile()', () => {
        beforeEach(() => {
            req.user = { id: 1 };
        });

        it('deve retornar perfil do usuário autenticado', async () => {
            // ARRANGE
            const profileData = {
                id: 1,
                name: 'João Silva',
                email: 'joao@test.com',
                created_at: new Date('2024-01-01'),
            };
            mockSingle.mockResolvedValue({ data: profileData, error: null });

            // ACT
            await userController.getProfile(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('users');
            expect(mockSelect).toHaveBeenCalledWith('id, name, email, created_at');
            expect(mockEq).toHaveBeenCalledWith('id', 1);
            expect(res.json).toHaveBeenCalledWith(profileData);
        });

        it('deve retornar 500 se houver erro ao buscar perfil', async () => {
            // ARRANGE
            const dbError = new Error('Erro ao buscar perfil');
            mockSingle.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await userController.getProfile(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: updateProfile()
    // ===========================

    describe('updateProfile()', () => {
        beforeEach(() => {
            req.user = { id: 1 };
            req.body = {
                name: 'João Silva Atualizado',
                email: 'joao.novo@test.com',
            };
        });

        it('deve atualizar perfil do usuário autenticado', async () => {
            // ARRANGE
            const updatedProfile = {
                id: 1,
                name: 'João Silva Atualizado',
                email: 'joao.novo@test.com',
            };
            mockSelect.mockResolvedValue({ data: [updatedProfile], error: null });

            // ACT
            await userController.updateProfile(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('users');
            expect(mockUpdate).toHaveBeenCalledWith({
                name: 'João Silva Atualizado',
                email: 'joao.novo@test.com',
            });
            expect(mockEq).toHaveBeenCalledWith('id', 1);
            expect(mockSelect).toHaveBeenCalledWith('id, name, email');
            expect(res.json).toHaveBeenCalledWith(updatedProfile);
        });

        it('deve retornar 500 se houver erro ao atualizar perfil', async () => {
            // ARRANGE
            const dbError = new Error('Erro ao atualizar');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await userController.updateProfile(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

    // ===========================
    // TESTES: subscribe()
    // ===========================

    describe('subscribe()', () => {
        beforeEach(() => {
            req.body = { email: 'subscriber@test.com' };
        });

        it('deve criar subscrição com email válido e retornar 201', async () => {
            // ARRANGE
            const subscriberData = {
                email: 'subscriber@test.com',
                subscribed_at: expect.any(Date),
            };
            mockSelect.mockResolvedValue({ 
                data: [subscriberData], 
                error: null 
            });

            // ACT
            await userController.subscribe(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('subscribers');
            expect(mockUpsert).toHaveBeenCalledWith(
                expect.objectContaining({ email: 'subscriber@test.com' }),
                { onConflict: 'email', ignoreDuplicates: false }
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Subscrição realizada com sucesso. Você receberá notificações de novos artigos.',
                subscriber: subscriberData,
            });
        });

        it('deve retornar 400 se email não for fornecido', async () => {
            // ARRANGE
            delete req.body.email;

            // ACT
            await userController.subscribe(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'O email é obrigatório para a subscrição.' 
            });
            expect(mockUpsert).not.toHaveBeenCalled();
        });

        it('deve retornar 500 se houver erro ao criar subscrição no banco', async () => {
            // ARRANGE
            const dbError = new Error('Erro de banco de dados');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await userController.subscribe(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });

        it('deve aceitar upsert para evitar duplicatas de email', async () => {
            // ARRANGE
            mockSelect.mockResolvedValue({ 
                data: [{ email: 'subscriber@test.com' }], 
                error: null 
            });

            // ACT
            await userController.subscribe(req, res);

            // ASSERT
            expect(mockUpsert).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ onConflict: 'email' })
            );
        });
    });

    // ===========================
    // TESTES: getSubscribers()
    // ===========================

    describe('getSubscribers()', () => {
        it('deve retornar array de emails de subscribers', async () => {
            // ARRANGE
            const subscribersData = [
                { email: 'user1@test.com' },
                { email: 'user2@test.com' },
                { email: 'user3@test.com' },
            ];
            mockSelect.mockResolvedValue({ data: subscribersData, error: null });

            // ACT
            const result = await userController.getSubscribers();

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('subscribers');
            expect(mockSelect).toHaveBeenCalledWith('email');
            expect(result).toEqual(['user1@test.com', 'user2@test.com', 'user3@test.com']);
        });

        it('deve retornar array vazio se não houver subscribers', async () => {
            // ARRANGE
            mockSelect.mockResolvedValue({ data: [], error: null });

            // ACT
            const result = await userController.getSubscribers();

            // ASSERT
            expect(result).toEqual([]);
        });

        it('deve retornar array vazio e logar erro se houver falha no banco', async () => {
            // ARRANGE
            const dbError = new Error('Erro ao buscar subscribers');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            // ACT
            const result = await userController.getSubscribers();

            // ASSERT
            expect(console.error).toHaveBeenCalledWith(
                'Erro ao buscar inscritos para notificação:',
                dbError.message
            );
            expect(result).toEqual([]);
        });

        it('deve retornar array vazio se exceção for lançada', async () => {
            // ARRANGE
            mockSelect.mockRejectedValue(new Error('Exceção inesperada'));

            // ACT
            const result = await userController.getSubscribers();

            // ASSERT
            expect(console.error).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });
});
