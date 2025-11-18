// Mock completo de TODAS as dependências antes de qualquer import
jest.mock('@supabase/supabase-js', () => {
    // 1. O Objeto central que todos os métodos de cadeia devem retornar
    const QueryBuilderMock = {}; 
    
    // 2. Defina os Mocks de função (sem .mockReturnThis() ou .mockImplementation() por enquanto)
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();
    const mockOr = jest.fn();

    // 3. Configure os Mocks de cadeia para retornarem o QueryBuilderMock
    // Usamos mockImplementation para garantir que ele retorna o objeto correto.
    const chainableMocks = [mockSelect, mockInsert, mockUpdate, mockDelete, mockEq, mockSingle, mockOr];
    chainableMocks.forEach(mockFn => {
        mockFn.mockImplementation(() => QueryBuilderMock);
    });

    // 4. Popule o Objeto Mock de Query Builder com as funções
    QueryBuilderMock.select = mockSelect;
    QueryBuilderMock.insert = mockInsert;
    QueryBuilderMock.update = mockUpdate;
    QueryBuilderMock.delete = mockDelete;
    QueryBuilderMock.eq = mockEq;
    QueryBuilderMock.single = mockSingle;
    QueryBuilderMock.or = mockOr;
    
    // 5. O mockFrom deve retornar o Objeto Mock de Query Builder
    const mockFrom = jest.fn(() => QueryBuilderMock); 
    
    // ... Código de Mock de Storage (pode ser reutilizado do seu código)
    const mockUpload = jest.fn();
    const mockGetPublicUrl = jest.fn(() => ({ data: { publicUrl: 'http://example.com/file.pdf' } }));
    const mockStorageFrom = jest.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
    }));

    return {
        createClient: jest.fn(() => ({
            from: mockFrom,
            storage: { from: mockStorageFrom }
        })),
        // Exportar os mocks para usar nos testes
        mockFrom, mockSelect, mockInsert, mockUpdate, mockDelete, mockEq, 
        mockSingle, mockOr, mockUpload, mockGetPublicUrl
    };
});

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
  unlinkSync: jest.fn()
}));

jest.mock('@orcid/bibtex-parse-js', () => ({
  toJSON: jest.fn()
}));

// Mock do userController sem dependências
// Linha 75 no seu teste (CORRETA)
// CORREÇÃO FINAL NA LINHA 76 DO SEU ARQUIVO DE TESTE
// O caminho é: sobe 2 níveis (até a raiz do projeto), desce para src/controllers/
jest.mock('../../src/controllers/userController', () => ({
    getSubscribers: jest.fn().mockResolvedValue([])
}));
// Mock do dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Variáveis de escopo para Request e Response
let req;
let res;
// Artigos de mock
const mockArticles = [
    { id: 1, title: 'Artigo 1', abstract: 'lorem ipsum' },
    { id: 2, title: 'Artigo 2', abstract: 'outro resumo' },
];

// AGORA importar o controller
const articleController = require('../../src/controllers/articleController');
const userController = require('../../src/controllers/userController');
const fs = require('fs');
const bibtexParse = require('@orcid/bibtex-parse-js');

// Importar os mocks do Supabase
const {
  createClient,
  mockFrom,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockSingle,
  mockOr,
  mockUpload,
  mockGetPublicUrl
} = require('@supabase/supabase-js');


describe('Article Controller', () => {

    // Configuração do Request e Response Mocks antes de CADA teste
    beforeEach(() => {
        // Reinicializa o mock de res para cada teste
        res = {
            json: jest.fn(function() { return this; }), // Retorna 'this' para encadeamento
            status: jest.fn(function() { return this; }), // Retorna 'this' para encadeamento
            send: jest.fn(function() { return this; }), // Retorna 'this' para encadeamento (usado no delete)
            end: jest.fn(function() { return this; }), // Para o delete 204
        };

        // Reinicializa o mock de req para cada teste
        req = {
            params: {},
            query: {},
            body: {},
            file: null, // Para testes que envolvem upload
        };

        // Limpa os mocks de função do Supabase e do Res
        jest.clearAllMocks();
    });
});

describe('update', () => {
        it('deve atualizar um artigo com sucesso', async () => {
            req.params.id = '1';
            req.body = { title: 'Título Atualizado' };
            const updatedArticle = { id: 1, title: 'Título Atualizado' };

            // MockUpdate deve ser chainable, e mockSelect resolve a Promise final
            mockSelect.mockResolvedValue({ data: [updatedArticle], error: null });

            await articleController.update(req, res);

            // Verifica se o update foi chamado com os dados corretos
            expect(mockUpdate).toHaveBeenCalledWith({ title: 'Título Atualizado' });
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.json).toHaveBeenCalledWith(updatedArticle);
        });

        it('deve retornar 400 se nenhum campo for fornecido para atualização', async () => {
            req.params.id = '1';
            req.body = {}; // Corpo vazio

            await articleController.update(req, res);

            // Cobre a branch if (Object.keys(updateData).length === 0)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Nenhum campo fornecido para atualização.' });
        });

        it('deve retornar 404 se o artigo a ser atualizado não for encontrado', async () => {
            req.params.id = '999';
            req.body = { title: 'Test' };

            // Simula o retorno de um array vazio (data.length === 0)
            mockSelect.mockResolvedValue({ data: [], error: null });

            await articleController.update(req, res);

            // Cobre a branch if (data.length === 0)
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Artigo não encontrado.' });
        });

        it('deve retornar 500 em caso de falha no banco de dados durante a atualização', async () => {
            req.params.id = '1';
            req.body = { title: 'Test' };
            const dbError = new Error('Falha de permissão');

            mockSelect.mockResolvedValue({ data: null, error: dbError });

            await articleController.update(req, res);

            // Cobre o catch
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });


    describe('delete', () => {
        it('deve deletar um artigo com sucesso e retornar 204', async () => {
            req.params.id = '1';

            // mockDelete deve ser o final da cadeia, resolvendo a Promise
            mockDelete.mockResolvedValue({ error: null });

            await articleController.delete(req, res);

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('deve retornar 500 em caso de falha no banco de dados durante a exclusão', async () => {
            req.params.id = '1';
            const dbError = new Error('Não é possível deletar');

            mockDelete.mockResolvedValue({ error: dbError });

            await articleController.delete(req, res);

            // Cobre o catch
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });

describe('getById', () => {
        // [Teste já existente: deve retornar um artigo pelo ID (sucesso)]

        it('deve retornar erro 404 se o artigo não for encontrado', async () => {
            req.params.id = '999';

            // Simula o retorno de null (não encontrado), cobrindo a branch if(!data)
            mockSingle.mockResolvedValue({ data: null, error: null });

            await articleController.getById(req, res);

            expect(mockEq).toHaveBeenCalledWith('id', '999');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Artigo não encontrado.' });
        });

        it('deve retornar erro 500 em caso de falha no banco de dados', async () => {
            req.params.id = '1';
            const dbError = new Error('Erro de conexão');

            // Simula um erro do Supabase
            mockSingle.mockResolvedValue({ data: null, error: dbError });

            await articleController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: dbError.message });
        });
    });



describe('Article Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar comportamentos padrão
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(Buffer.from('file content'));
    
    req = {
      params: {},
      query: {},
      body: {},
      file: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  describe('getAll', () => {
    it('deve retornar todos os artigos', async () => {
      const mockArticles = [
        { id: 1, title: 'Artigo 1', authors: 'Autor 1' },
        { id: 2, title: 'Artigo 2', authors: 'Autor 2' }
      ];

      mockSelect.mockResolvedValue({ data: mockArticles, error: null });

      await articleController.getAll(req, res);

      expect(mockFrom).toHaveBeenCalledWith('articles');
      expect(res.json).toHaveBeenCalledWith(mockArticles);
    });

    it('deve retornar erro 500 em caso de falha', async () => {
      const mockError = new Error('Erro de banco de dados');
      mockSelect.mockResolvedValue({ data: null, error: mockError });

      await articleController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
    });

    it('deve retornar artigos filtrados por search query', async () => {
            req.query.search = 'teste';
            const mockArticles = [
                { id: 1, title: 'Artigo Teste', authors: 'Autor 1' },
            ];
            
            // Simula o sucesso com o filtro .or() aplicado
            mockSelect.mockResolvedValue({ data: mockArticles, error: null });

            await articleController.getAll(req, res);

            // Verifica se a função .or() foi chamada (cobrindo a branch `if (search)`)
            expect(mockOr).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockArticles);
        });
  });

  describe('create', () => {
    it('deve criar um novo artigo com arquivo PDF', async () => {
      req.body = {
            title: 'Novo Artigo',
            authors: 'Autor Teste',
            edition_id: 1,
            abstract: 'Resumo do artigo'
        };
        // CORREÇÃO 2A: Garanta que o req.file tenha as propriedades que o controller espera
        req.file = {
            path: '/tmp/file.pdf', // Necessário para fs.readFileSync/existsSync/unlinkSync
            filename: 'file.pdf', // Necessário para construir storagePath
            mimetype: 'application/pdf' // Necessário para o upload do Supabase
        };

        const mockArticle = {
            id: 1,
            title: 'Novo Artigo',
            authors: 'Autor Teste',
            pdf_url: 'http://example.com/file.pdf',
            abstract: 'Resumo do artigo'
        };

    mockUpload.mockResolvedValue({ error: null });
    mockSelect.mockResolvedValue({ data: [mockArticle], error: null });

      await articleController.create(req, res);

      expect(mockUpload).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockArticle);
    });

    it('deve retornar erro 400 se campos obrigatórios estiverem faltando', async () => {
      req.body = { title: 'Artigo' };
      req.file = { path: '/tmp/file.pdf' };
      await articleController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path);
    });

    it('deve retornar 500 se houver falha no upload do Supabase Storage', async () => {
            req.body = { title: 'T', authors: 'A', edition_id: 1, abstract: 'R' };
            req.file = {
                path: '/tmp/file.pdf', 
                filename: 'file.pdf',
                mimetype: 'application/pdf'
            };
            const uploadError = new Error('Falha no S3');

            // Força o erro no upload, cobrindo a branch if(uploadError) e o catch
            mockUpload.mockResolvedValue({ error: uploadError });

            await articleController.create(req, res);

            expect(mockUpload).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            // Verifica se o arquivo temporário foi deletado no catch
            expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path); 
        });

        it('deve retornar 500 se houver falha na inserção no banco de dados', async () => {
            req.body = { title: 'T', authors: 'A', edition_id: 1, abstract: 'R' };
            req.file = { path: '/tmp/file.pdf', filename: 'file.pdf', mimetype: 'application/pdf' };
            const insertError = new Error('Erro de BD');
            
            mockUpload.mockResolvedValue({ error: null });
            // Força o erro na inserção (o final da cadeia .select()), cobrindo a branch if(insertError) e o catch
            mockSelect.mockResolvedValue({ data: null, error: insertError });

            await articleController.create(req, res);

            expect(mockInsert).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(fs.unlinkSync).toHaveBeenCalledWith(req.file.path);
        });
  });
});