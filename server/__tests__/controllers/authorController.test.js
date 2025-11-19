// ============================================================================// ===========================
// 1. MOCKS DE DEPENDÊNCIAS (ANTES de qualquer import)
// ===========================

const mockSelect = jest.fn();
const mockIlike = jest.fn();
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

// Mock do console.error
global.console.error = jest.fn();

// ===========================
// 2. IMPORTS
// ===========================

const authorController = require('../../src/controllers/authorController');

// ===========================
// 3. FIXTURES DE TESTE
// ===========================

const mockArticles = [
    {
        id: 1,
        title: 'Artigo sobre Redes 2024',
        authors: 'João Silva, Maria Santos',
        event_editions: { year: 2024 },
    },
    {
        id: 2,
        title: 'Artigo sobre Cloud 2024',
        authors: 'João Silva, Pedro Costa',
        event_editions: { year: 2024 },
    },
    {
        id: 3,
        title: 'Artigo sobre IA 2023',
        authors: 'João Silva',
        event_editions: { year: 2023 },
    },
];

const mockArticlesWithoutYear = [
    {
        id: 4,
        title: 'Artigo sem edição',
        authors: 'João Silva',
        event_editions: null,
    },
];

// ===========================
// 4. SUITE DE TESTES
// ===========================

describe('AuthorController - Testes Completos', () => {
    let req, res;

    beforeEach(() => {
        // Limpar todos os mocks
        jest.clearAllMocks();

        // Configurar comportamento chainable do Supabase
        mockSelect.mockReturnThis();
        mockIlike.mockResolvedValue({ data: [], error: null });

        // Configurar mockFrom para retornar query builder
        mockFrom.mockReturnValue({
            select: mockSelect,
            ilike: mockIlike,
        });

        // Configurar req e res
        req = {
            params: {
                authorName: 'João Silva',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    // ===========================
    // TESTES: getArticlesByAuthor()
    // ===========================

    describe('getArticlesByAuthor()', () => {
        it('deve retornar artigos agrupados por ano para um autor', async () => {
            // ARRANGE
            mockIlike.mockResolvedValue({ data: mockArticles, error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(mockFrom).toHaveBeenCalledWith('articles');
            expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('id'));
            expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('title'));
            expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('authors'));
            expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('event_editions'));
            expect(mockIlike).toHaveBeenCalledWith('authors', '%João Silva%');
            
            expect(res.json).toHaveBeenCalledWith({
                author: 'João Silva',
                articles: {
                    2024: [mockArticles[0], mockArticles[1]],
                    2023: [mockArticles[2]],
                },
            });
        });

        it('deve decodificar URL-encoded no nome do autor', async () => {
            // ARRANGE
            req.params.authorName = 'Jo%C3%A3o%20Silva';
            mockIlike.mockResolvedValue({ data: mockArticles, error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(mockIlike).toHaveBeenCalledWith('authors', '%João Silva%');
        });

        it('deve usar "Ano Desconhecido" para artigos sem event_editions', async () => {
            // ARRANGE
            mockIlike.mockResolvedValue({ 
                data: mockArticlesWithoutYear, 
                error: null 
            });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(res.json).toHaveBeenCalledWith({
                author: 'João Silva',
                articles: {
                    'Ano Desconhecido': [mockArticlesWithoutYear[0]],
                },
            });
        });

        it('deve fazer busca case-insensitive usando ilike', async () => {
            // ARRANGE
            req.params.authorName = 'JOÃO SILVA';
            mockIlike.mockResolvedValue({ data: mockArticles, error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(mockIlike).toHaveBeenCalledWith('authors', '%JOÃO SILVA%');
            expect(res.json).toHaveBeenCalled();
        });

        it('deve retornar 404 se nenhum artigo for encontrado', async () => {
            // ARRANGE
            mockIlike.mockResolvedValue({ data: [], error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Nenhum artigo encontrado para o autor: João Silva' 
            });
        });

        it('deve retornar 404 se data for null', async () => {
            // ARRANGE
            mockIlike.mockResolvedValue({ data: null, error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Nenhum artigo encontrado para o autor: João Silva' 
            });
        });

        it('deve retornar 500 em caso de erro no banco de dados', async () => {
            // ARRANGE
            const dbError = new Error('Database connection failed');
            mockIlike.mockResolvedValue({ data: null, error: dbError });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(console.error).toHaveBeenCalledWith(
                'ERRO DETALHADO DO SUPABASE AO BUSCAR AUTOR:',
                dbError
            );
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });

        it('deve agrupar múltiplos artigos do mesmo ano corretamente', async () => {
            // ARRANGE
            const articlesYear2024 = [
                { id: 1, title: 'Artigo 1', authors: 'João Silva', event_editions: { year: 2024 } },
                { id: 2, title: 'Artigo 2', authors: 'João Silva', event_editions: { year: 2024 } },
                { id: 3, title: 'Artigo 3', authors: 'João Silva', event_editions: { year: 2024 } },
            ];
            mockIlike.mockResolvedValue({ data: articlesYear2024, error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(res.json).toHaveBeenCalledWith({
                author: 'João Silva',
                articles: {
                    2024: articlesYear2024,
                },
            });
        });

        it('deve lidar com caracteres especiais no nome do autor', async () => {
            // ARRANGE
            req.params.authorName = "O'Connor";
            mockIlike.mockResolvedValue({ data: [], error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(mockIlike).toHaveBeenCalledWith('authors', "%O'Connor%");
        });

        it('deve buscar autor que aparece no meio da string de autores', async () => {
            // ARRANGE
            const articlesMiddleAuthor = [
                {
                    id: 10,
                    title: 'Artigo com múltiplos autores',
                    authors: 'Pedro Costa, João Silva, Maria Santos',
                    event_editions: { year: 2024 },
                },
            ];
            mockIlike.mockResolvedValue({ data: articlesMiddleAuthor, error: null });

            // ACT
            await authorController.getArticlesByAuthor(req, res);

            // ASSERT
            expect(mockIlike).toHaveBeenCalledWith('authors', '%João Silva%');
            expect(res.json).toHaveBeenCalledWith({
                author: 'João Silva',
                articles: {
                    2024: articlesMiddleAuthor,
                },
            });
        });
    });
});
