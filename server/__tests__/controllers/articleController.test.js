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

// Mock correto do bibtex-parse-js
const mockToJSON = jest.fn();
jest.mock('@orcid/bibtex-parse-js', () => ({
    toJSON: mockToJSON,
}));

// Mock do userController para notificações
const mockGetSubscribers = jest.fn();
jest.mock('../../src/controllers/userController', () => ({
    getSubscribers: mockGetSubscribers,
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
global.console.log = jest.fn();

// ===========================
// 2. IMPORTS
// ===========================

const articleController = require('../../src/controllers/articleController');

// ===========================
// 3. TESTES
// ===========================

describe('ArticleController - Testes Completos com 100% Cobertura', () => {
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

        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.unlinkSync = jest.fn();
        fs.readFileSync = jest.fn();
    });

    // ===========================
    // TESTES: getAll()
    // ===========================
    describe('getAll()', () => {
        const mockArticles = [
            { id: 1, title: 'Artigo 1', authors: 'João Silva' },
            { id: 2, title: 'Artigo 2', authors: 'Maria Santos' },
        ];

        it('deve retornar todos os artigos sem busca', async () => {
            mockSelect.mockResolvedValue({ data: mockArticles, error: null });

            await articleController.getAll(req, res);

            expect(mockFrom).toHaveBeenCalledWith('articles');
            expect(mockOr).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockArticles);
        });

        it('deve filtrar artigos por search query (título e autores)', async () => {
            req.query.search = 'teste';
            mockOr.mockResolvedValue({ data: mockArticles, error: null });

            await articleController.getAll(req, res);

            expect(mockOr).toHaveBeenCalledWith('title.ilike.%teste%,authors.ilike.%teste%');
            expect(res.json).toHaveBeenCalledWith(mockArticles);
        });

        it('deve retornar erro 500 em caso de falha no banco', async () => {
            const dbError = new Error('Database connection failed');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            await articleController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
        });
    });

    // ===========================
    // TESTES: getById()
    // ===========================
    describe('getById()', () => {
        it('deve retornar artigo pelo ID', async () => {
            req.params.id = '1';
            const mockArticle = { id: 1, title: 'Artigo Teste', abstract: 'Resumo teste' };
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
            expect(res.json).toHaveBeenCalledWith({ error: 'Artigo não encontrado.' });
        });

        it('deve retornar 500 em caso de erro no banco', async () => {
            req.params.id = '1';
            const dbError = new Error('Database error');
            mockSingle.mockResolvedValue({ data: null, error: dbError });

            await articleController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    // ===========================
    // TESTES: create() - COMPLETO COM ABSTRACT
    // ===========================
    describe('create()', () => {
        beforeEach(() => {
            req.file = { 
                path: '/tmp/test.pdf', 
                originalname: 'test.pdf',
                filename: 'test-123.pdf',
                mimetype: 'application/pdf'
            };
            req.body = {
                title: 'Novo Artigo',
                edition_id: '1',
                authors: 'João Silva',
                abstract: 'Este é o resumo do artigo de teste'
            };
            fs.readFileSync.mockReturnValue(Buffer.from('PDF content'));
        });

        it('deve criar artigo com PDF e abstract com sucesso', async () => {
            mockUpload.mockResolvedValue({ data: { path: 'public/test-123.pdf' }, error: null });
            mockGetPublicUrl.mockReturnValue({
                data: { publicUrl: 'https://storage.supabase.co/test.pdf' },
            });
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{ 
                        id: 1, 
                        title: 'Novo Artigo', 
                        authors: 'João Silva',
                        abstract: 'Este é o resumo do artigo de teste',
                        pdf_url: 'https://storage.supabase.co/test.pdf',
                        event_edition_id: '1'
                    }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.create(req, res);

            expect(fs.readFileSync).toHaveBeenCalledWith('/tmp/test.pdf');
            expect(mockUpload).toHaveBeenCalledWith(
                'public/test-123.pdf',
                Buffer.from('PDF content'),
                { contentType: 'application/pdf', upsert: false }
            );
            expect(mockInsert).toHaveBeenCalledWith([{
                title: 'Novo Artigo',
                authors: 'João Silva',
                abstract: 'Este é o resumo do artigo de teste',
                event_edition_id: '1',
                pdf_url: 'https://storage.supabase.co/test.pdf'
            }]);
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('deve retornar 400 se title não for fornecido', async () => {
            delete req.body.title;

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Todos os campos e o ficheiro PDF são obrigatórios.' 
            });
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
        });

        it('deve retornar 400 se authors não for fornecido', async () => {
            delete req.body.authors;

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
        });

        it('deve retornar 400 se edition_id não for fornecido', async () => {
            delete req.body.edition_id;

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
        });

        it('deve retornar 400 se abstract não for fornecido', async () => {
            delete req.body.abstract;

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Todos os campos e o ficheiro PDF são obrigatórios.' 
            });
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
        });

        it('deve retornar 400 se PDF não for fornecido', async () => {
            req.file = null;

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockUpload).not.toHaveBeenCalled();
        });

        it('deve retornar 500 em caso de erro no upload do Storage', async () => {
            const uploadError = new Error('Storage full');
            mockUpload.mockResolvedValue({ data: null, error: uploadError });

            await articleController.create(req, res);

            expect(console.error).toHaveBeenCalledWith('ERRO DETALHADO DO SUPABASE AO CRIAR ARTIGO:', uploadError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Falha no upload ou inserção: Storage full' });
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
        });

        it('deve retornar 500 em caso de erro na inserção do banco', async () => {
            mockUpload.mockResolvedValue({ data: { path: 'test.pdf' }, error: null });
            mockGetPublicUrl.mockReturnValue({
                data: { publicUrl: 'https://storage.supabase.co/test.pdf' },
            });
            
            const insertError = new Error('Duplicate entry');
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: null,
                    error: insertError,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test.pdf');
        });

        it('deve remover arquivo mesmo quando fs.existsSync retorna false no catch', async () => {
            fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
            mockUpload.mockResolvedValue({ data: null, error: new Error('Upload failed') });

            await articleController.create(req, res);

            expect(fs.unlinkSync).not.toHaveBeenCalled();
        });
    });

    // ===========================
    // TESTES: update() - COMPLETO COM ABSTRACT
    // ===========================
    describe('update()', () => {
        it('deve atualizar title com sucesso', async () => {
            req.params.id = '1';
            req.body = { title: 'Título Atualizado' };
            mockSelect.mockResolvedValue({
                data: [{ id: 1, title: 'Título Atualizado' }],
                error: null,
            });

            await articleController.update(req, res);

            expect(mockUpdate).toHaveBeenCalledWith({ title: 'Título Atualizado' });
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Título Atualizado' });
        });

        it('deve atualizar authors com sucesso', async () => {
            req.params.id = '1';
            req.body = { authors: 'Maria Santos, João Silva' };
            mockSelect.mockResolvedValue({
                data: [{ id: 1, authors: 'Maria Santos, João Silva' }],
                error: null,
            });

            await articleController.update(req, res);

            expect(mockUpdate).toHaveBeenCalledWith({ authors: 'Maria Santos, João Silva' });
        });

        it('deve atualizar edition_id (event_edition_id) com sucesso', async () => {
            req.params.id = '1';
            req.body = { edition_id: '5' };
            mockSelect.mockResolvedValue({
                data: [{ id: 1, event_edition_id: '5' }],
                error: null,
            });

            await articleController.update(req, res);

            expect(mockUpdate).toHaveBeenCalledWith({ event_edition_id: '5' });
        });

        it('deve atualizar abstract com sucesso', async () => {
            req.params.id = '1';
            req.body = { abstract: 'Novo resumo atualizado' };
            mockSelect.mockResolvedValue({
                data: [{ id: 1, abstract: 'Novo resumo atualizado' }],
                error: null,
            });

            await articleController.update(req, res);

            expect(mockUpdate).toHaveBeenCalledWith({ abstract: 'Novo resumo atualizado' });
        });

        it('deve atualizar múltiplos campos simultaneamente', async () => {
            req.params.id = '1';
            req.body = { 
                title: 'Novo Título', 
                authors: 'Autor Novo',
                abstract: 'Novo abstract',
                edition_id: '3'
            };
            mockSelect.mockResolvedValue({
                data: [{ 
                    id: 1, 
                    title: 'Novo Título',
                    authors: 'Autor Novo',
                    abstract: 'Novo abstract',
                    event_edition_id: '3'
                }],
                error: null,
            });

            await articleController.update(req, res);

            expect(mockUpdate).toHaveBeenCalledWith({ 
                title: 'Novo Título',
                authors: 'Autor Novo',
                abstract: 'Novo abstract',
                event_edition_id: '3'
            });
        });

        it('deve retornar 400 se nenhum campo for fornecido', async () => {
            req.params.id = '1';
            req.body = {};

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Nenhum campo fornecido para atualização.' });
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('deve retornar 404 se artigo não for encontrado', async () => {
            req.params.id = '999';
            req.body = { title: 'Test' };
            mockSelect.mockResolvedValue({ data: [], error: null });

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Artigo não encontrado.' });
        });

        it('deve retornar 500 em caso de erro no banco', async () => {
            req.params.id = '1';
            req.body = { title: 'Test' };
            const dbError = new Error('Update failed');
            mockSelect.mockResolvedValue({ data: null, error: dbError });

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
        });
    });

    // ===========================
    // TESTES: delete()
    // ===========================
    describe('delete()', () => {
        it('deve deletar artigo com sucesso', async () => {
            req.params.id = '1';
            mockEq.mockResolvedValue({ error: null });

            await articleController.delete(req, res);

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('deve retornar 500 em caso de erro no banco', async () => {
            req.params.id = '1';
            const dbError = new Error('Delete constraint violation');
            mockEq.mockResolvedValue({ error: dbError });

            await articleController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Delete constraint violation' });
        });
    });

    // ===========================
    // TESTES: importBibtex() - COMPLETO COM NOTIFICAÇÕES
    // ===========================
    describe('importBibtex()', () => {
        beforeEach(() => {
            req.file = {
                path: '/tmp/articles.bib',
                filename: 'articles.bib'
            };
            req.body = {
                edition_id: '1'
            };
            fs.readFileSync.mockReturnValue(`
                @article{silva2024,
                    title = {Artigo de Teste},
                    author = {Silva, João and Santos, Maria},
                    abstract = {Este é um resumo de teste}
                }
            `);
        });

        it('deve importar BibTeX com 1 artigo e enviar notificação', async () => {
            const parsedEntries = [{
                citationKey: 'silva2024',
                entryType: 'ARTICLE',
                entryTags: {
                    title: 'Artigo de Teste',
                    author: 'Silva, João and Santos, Maria',
                    abstract: 'Este é um resumo de teste'
                }
            }];
            
            mockToJSON.mockReturnValue(parsedEntries);
            mockGetSubscribers.mockResolvedValue([
                { email: 'user1@test.com' },
                { email: 'user2@test.com' }
            ]);
            
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{
                        id: 1,
                        title: 'Artigo de Teste',
                        authors: 'Silva, João, Santos, Maria',
                        abstract: 'Este é um resumo de teste',
                        event_edition_id: '1'
                    }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(fs.readFileSync).toHaveBeenCalledWith('/tmp/articles.bib', 'utf8');
            expect(mockToJSON).toHaveBeenCalled();
            expect(mockInsert).toHaveBeenCalledWith([{
                title: 'Artigo de Teste',
                authors: 'Silva, João, Santos, Maria',
                abstract: 'Este é um resumo de teste',
                event_edition_id: '1'
            }]);
            expect(mockGetSubscribers).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(
                'Simulando envio de e-mail sobre o novo artigo: "Artigo de Teste" para 2 destinatários.'
            );
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/articles.bib');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Importação de BibTeX concluída. 1 artigos criados.',
                articles_created: expect.any(Array)
            });
        });

        it('deve importar múltiplos artigos e enviar notificação coletiva', async () => {
            const parsedEntries = [
                {
                    citationKey: 'silva2024',
                    entryType: 'ARTICLE',
                    entryTags: {
                        title: 'Artigo 1',
                        author: 'Silva, João',
                        abstract: 'Abstract 1'
                    }
                },
                {
                    citationKey: 'santos2024',
                    entryType: 'ARTICLE',
                    entryTags: {
                        title: 'Artigo 2',
                        author: 'Santos, Maria',
                        abstract: 'Abstract 2'
                    }
                }
            ];
            
            mockToJSON.mockReturnValue(parsedEntries);
            mockGetSubscribers.mockResolvedValue([{ email: 'user@test.com' }]);
            
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [
                        { id: 1, title: 'Artigo 1', authors: 'Silva, João', abstract: 'Abstract 1', event_edition_id: '1' },
                        { id: 2, title: 'Artigo 2', authors: 'Santos, Maria', abstract: 'Abstract 2', event_edition_id: '1' }
                    ],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(console.log).toHaveBeenCalledWith(
                'Simulando envio de e-mail sobre o novo artigo: "Importação de 2 novos artigos" para 1 destinatários.'
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'Importação de BibTeX concluída. 2 artigos criados.',
                articles_created: expect.any(Array)
            });
        });

        it('deve processar artigo sem autor (Autor Desconhecido)', async () => {
            const parsedEntries = [{
                citationKey: 'test2024',
                entryType: 'ARTICLE',
                entryTags: {
                    title: 'Artigo Sem Autor',
                    abstract: 'Resumo teste'
                }
            }];
            
            mockToJSON.mockReturnValue(parsedEntries);
            mockGetSubscribers.mockResolvedValue([]);
            
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{
                        id: 1,
                        title: 'Artigo Sem Autor',
                        authors: 'Autor Desconhecido',
                        abstract: 'Resumo teste',
                        event_edition_id: '1'
                    }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(mockInsert).toHaveBeenCalledWith([{
                title: 'Artigo Sem Autor',
                authors: 'Autor Desconhecido',
                abstract: 'Resumo teste',
                event_edition_id: '1'
            }]);
        });

        it('deve processar artigo sem título (Título não encontrado)', async () => {
            const parsedEntries = [{
                citationKey: 'test2024',
                entryType: 'ARTICLE',
                entryTags: {
                    author: 'Silva, João',
                    abstract: 'Resumo'
                }
            }];
            
            mockToJSON.mockReturnValue(parsedEntries);
            mockGetSubscribers.mockResolvedValue([]);
            
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{
                        id: 1,
                        title: 'Título não encontrado',
                        authors: 'Silva, João',
                        abstract: 'Resumo',
                        event_edition_id: '1'
                    }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(mockInsert).toHaveBeenCalledWith([{
                title: 'Título não encontrado',
                authors: 'Silva, João',
                abstract: 'Resumo',
                event_edition_id: '1'
            }]);
        });

        it('deve processar artigo sem abstract (Resumo não disponível)', async () => {
            const parsedEntries = [{
                citationKey: 'test2024',
                entryType: 'ARTICLE',
                entryTags: {
                    title: 'Artigo Teste',
                    author: 'Silva, João'
                }
            }];
            
            mockToJSON.mockReturnValue(parsedEntries);
            mockGetSubscribers.mockResolvedValue([]);
            
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{
                        id: 1,
                        title: 'Artigo Teste',
                        authors: 'Silva, João',
                        abstract: 'Resumo não disponível.',
                        event_edition_id: '1'
                    }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(mockInsert).toHaveBeenCalledWith([{
                title: 'Artigo Teste',
                authors: 'Silva, João',
                abstract: 'Resumo não disponível.',
                event_edition_id: '1'
            }]);
        });

        it('deve retornar 400 se edition_id não for fornecido', async () => {
            delete req.body.edition_id;

            await articleController.importBibtex(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'ID da edição e o ficheiro BibTeX são obrigatórios.' 
            });
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/articles.bib');
        });

        it('deve retornar 400 se arquivo não for fornecido', async () => {
            req.file = null;

            await articleController.importBibtex(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockToJSON).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se BibTeX não tiver entradas válidas', async () => {
            mockToJSON.mockReturnValue([]);

            await articleController.importBibtex(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Nenhuma entrada válida encontrada no ficheiro BibTeX.' 
            });
        });

        it('deve retornar 400 se BibTeX retornar null', async () => {
            mockToJSON.mockReturnValue(null);

            await articleController.importBibtex(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve capturar erro do parse do BibTeX', async () => {
            const parseError = new Error('Invalid BibTeX format');
            mockToJSON.mockImplementation(() => {
                throw parseError;
            });

            await articleController.importBibtex(req, res);

            expect(console.error).toHaveBeenCalledWith('Erro ao fazer o parse do BibTeX:', parseError);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 500 em caso de erro na inserção do banco', async () => {
            const parsedEntries = [{
                citationKey: 'test2024',
                entryType: 'ARTICLE',
                entryTags: {
                    title: 'Test',
                    author: 'Author',
                    abstract: 'Abstract'
                }
            }];
            
            mockToJSON.mockReturnValue(parsedEntries);
            
            const insertError = new Error('Database insertion failed');
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: null,
                    error: insertError,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Database insertion failed' 
            });
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/articles.bib');
        });

        it('não deve enviar notificação se não houver subscribers', async () => {
            const parsedEntries = [{
                citationKey: 'test2024',
                entryType: 'ARTICLE',
                entryTags: {
                    title: 'Test',
                    author: 'Author',
                    abstract: 'Abstract'
                }
            }];
            
            mockToJSON.mockReturnValue(parsedEntries);
            mockGetSubscribers.mockResolvedValue([]);
            
            const mockInsertChain = {
                select: jest.fn().mockResolvedValue({
                    data: [{ id: 1, title: 'Test' }],
                    error: null,
                }),
            };
            mockInsert.mockReturnValue(mockInsertChain);

            await articleController.importBibtex(req, res);

            expect(console.log).toHaveBeenCalledWith('Nenhum assinante para notificar.');
        });

        it('deve remover arquivo temporário mesmo quando existe erro e arquivo não existe', async () => {
            fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
            mockToJSON.mockImplementation(() => {
                throw new Error('Parse error');
            });

            await articleController.importBibtex(req, res);

            expect(fs.unlinkSync).not.toHaveBeenCalled();
        });
    });
});
