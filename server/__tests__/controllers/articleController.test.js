// ============================================================================
// ARQUIVO DE TESTE COMPLETO - articleController.test.js (VERSÃO CORRIGIDA)
// Engenheiro de QA Sênior - Padrão AAA (Arrange, Act, Assert)
// ============================================================================

// ===========================
// 1. MOCKS (ANTES DOS IMPORTS)
// ===========================

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOr = jest.fn();
const mockFrom = jest.fn();
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: mockFrom,
        storage: {
            from: jest.fn(() => ({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            })),
        },
    })),
}));

jest.mock('fs');
const fs = require('fs');

const mockParseBibtex = jest.fn();

jest.mock('@orcid/bibtex-parse-js', () => ({
    parseBibtex: mockParseBibtex,
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(),
}));

global.console.error = jest.fn();

// ===========================
// 2. IMPORTS
// ===========================

const articleController = require('../../src/controllers/articleController');

// ===========================
// 3. TESTES
// ===========================

describe('ArticleController - Testes Completos', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSelect.mockReturnThis();
        mockInsert.mockReturnThis();
        mockUpdate.mockReturnThis();
        mockDelete.mockReturnThis();
        mockOr.mockReturnThis();

        mockEq.mockReturnValue({
            single: mockSingle,
            select: mockSelect,
        });

        mockSingle.mockReturnThis();

        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
            eq: mockEq,
            single: mockSingle,
            or: mockOr,
        });

        req = {
            params: {},
            query: {},
            body: {},
            file: null,
        };

        res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });
    // ===========================
    // TESTES: getAll()
    // ===========================
    describe('getAll()', () => {
        const mockArticles = [
            { id: 1, title: 'Artigo 1' },
            { id: 2, title: 'Artigo 2' },
        ];

        it('deve retornar todos os artigos sem busca', async () => {
            mockSelect.mockResolvedValue({ data: mockArticles, error: null });

            await articleController.getAll(req, res);

            expect(mockFrom).toHaveBeenCalledWith('articles');
            expect(mockOr).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockArticles);
        });

        it('deve filtrar artigos por search query', async () => {
            req.query.search = 'teste';
            mockOr.mockResolvedValue({ data: mockArticles, error: null });

            await articleController.getAll(req, res);

            expect(mockOr).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockArticles);
        });

        it('deve retornar erro 500 em caso de falha', async () => {
            const dbError = new Error('DB Error');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            await articleController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
    // ===========================
    // TESTES: getById()
    // ===========================
    describe('getById()', () => {
        it('deve retornar artigo pelo ID', async () => {
            req.params.id = '1';
            const mockArticle = { id: 1, title: 'Artigo Teste' };
            mockSingle.mockResolvedValue({ data: mockArticle, error: null });

            await articleController.getById(req, res);

            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.json).toHaveBeenCalledWith(mockArticle);
        });

        it('deve retornar 404 se artigo não for encontrado', async () => {
            req.params.id = '999';
            mockSingle.mockResolvedValue({ data: null, error: null });

            await articleController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ===========================
    // TESTES: create()
    // ===========================

    describe('create()', () => {
        beforeEach(() => {
            req.file = { path: '/tmp/test.pdf', originalname: 'test.pdf' };
            req.body = {
                title: 'Novo Artigo',
                edition_id: '1',
                authors: 'João Silva',
            };
            fs.existsSync = jest.fn().mockReturnValue(true);
            fs.unlinkSync = jest.fn();
        });

        it('deve criar artigo com PDF com sucesso', async () => {
            mockUpload.mockResolvedValue({ data: { path: 'test.pdf' }, error: null });
            mockGetPublicUrl.mockReturnValue({
                data: { publicUrl: 'https://storage/test.pdf' },
            });
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{ id: 1, title: 'Novo Artigo', url: 'https://storage/test.pdf' }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.create(req, res);

            expect(mockUpload).toHaveBeenCalled();
            expect(mockInsert).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('deve retornar 400 se campos obrigatórios não forem fornecidos', async () => {
            delete req.body.title;

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se PDF não for fornecido', async () => {
            req.file = null;

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 500 em caso de erro no upload', async () => {
            const uploadError = new Error('Falha no upload');
            mockUpload.mockResolvedValue({ data: null, error: uploadError });

            await articleController.create(req, res);

            expect(console.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
        });
    });

    // ===========================
    // TESTES: update()
    // ===========================

    describe('update()', () => {
        it('deve atualizar artigo com sucesso', async () => {
            req.params.id = '1';
            req.body = { title: 'Título Atualizado' };
            mockSelect.mockResolvedValue({
                data: [{ id: 1, title: 'Título Atualizado' }],
                error: null,
            });

            await articleController.update(req, res);

            expect(mockUpdate).toHaveBeenCalledWith({ title: 'Título Atualizado' });
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.json).toHaveBeenCalled();
        });

        it('deve retornar 400 se nenhum campo for fornecido', async () => {
            req.params.id = '1';
            req.body = {};

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 404 se artigo não for encontrado', async () => {
            req.params.id = '999';
            req.body = { title: 'Test' };
            mockSelect.mockResolvedValue({ data: [], error: null });

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ===========================
    // TESTES: delete()
    // ===========================

    describe('delete()', () => {
        it('deve deletar artigo com sucesso', async () => {
            req.params.id = '1';
            // delete().eq() retorna Promise
            mockEq.mockResolvedValue({ error: null });

            await articleController.delete(req, res);

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('deve retornar 500 em caso de erro', async () => {
            req.params.id = '1';
            const dbError = new Error('Erro ao deletar');
            mockDelete.mockResolvedValue({ error: dbError });

            await articleController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ===========================
    // TESTES: importBibtex()
    // ===========================

    describe('importBibtex()', () => {
        beforeEach(() => {
            req.body = {
                bibtexContent: '@article{test2024, title={Test Article}}',
                edition_id: '1',
            };
        });

        it('deve importar BibTeX com sucesso', async () => {
            mockParseBibtex.mockReturnValue({
                entries: {
                    test2024: {
                        getFieldAsString: jest.fn((field) => {
                            const fields = {
                                title: 'Test Article',
                                author: 'John Doe',
                                year: '2024',
                            };
                            return fields[field] || '';
                        }),
                    },
                },
            });

            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{ id: 1, title: 'Test Article' }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(mockParseBibtex).toHaveBeenCalled();
            expect(mockInsert).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('deve retornar 400 se bibtexContent não for fornecido', async () => {
            delete req.body.bibtexContent;

            await articleController.importBibtex(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 400 se edition_id não for fornecido', async () => {
            delete req.body.edition_id;

            await articleController.importBibtex(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 500 em caso de erro no parse', async () => {
            mockParseBibtex.mockImplementation(() => {
                throw new Error('Parse error');
            });

            await articleController.importBibtex(req, res);

            expect(console.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
