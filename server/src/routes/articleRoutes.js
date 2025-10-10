const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const multer = require('multer');
const path = require('path'); // <--- NOVO: Módulo nativo para caminhos
// 1. Importar Multer
// 1. CONFIGURAÇÃO DE ARMAZENAMENTO (diskStorage)
const storage = multer.diskStorage({
    // Define o destino da pasta 'uploads' usando um caminho absoluto
    destination: function (req, file, cb) {
        // path.join(process.cwd(), 'uploads') resolve o caminho a partir da raiz do projeto,
        // garantindo que funcione mesmo estando na subpasta 'routes'.
        cb(null, path.join(process.cwd(), 'uploads')); 
    },
    // Define o nome do arquivo, garantindo a extensão original
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalExtension = file.originalname.split('.').pop();
        // Exemplo de nome: pdfFile-1734204859874-90184712.pdf
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + originalExtension);
    }
});

// 2. MIDDLEWARE DE UPLOAD
const upload = multer({ 
    storage: storage,
    // Adiciona o filtro de segurança para aceitar apenas PDFs
    // fileFilter: (req, file, cb) => {
    //     if (file.mimetype === 'application/pdf') {
    //         cb(null, true);
    //     } else {
    //         cb(new Error('Tipo de arquivo inválido. Apenas PDFs são permitidos.'), false);
    //     }
    //  }
    });


// 2. Configurar destino temporário para arquivos
// const upload = multer({ dest: 'uploads/' }); 
// GET /artigos - Lista todos os artigos (também lida com GET /artigos?search=... - Sprint 3, 5)
router.get('/', articleController.getAll); 

router.post('/import-pdf', upload.single('pdfFile'), articleController.create);
// POST /artigos/importar-bibtex - Importação em massa via BibTeX (Sprint 4)
router.post('/import-bibtex', upload.single('bibtexFile'), articleController.importBibtex); 
// --- Rotas com Parâmetro ID para CRUD Específico (Sprint 3) ---
// GET /artigos/:id - Retorna um artigo específico
router.get('/:id', articleController.getById);
// PUT /artigos/:id - Atualiza um artigo específico
router.put('/:id', articleController.update);
// DELETE /artigos/:id - Deleta um artigo específico
router.delete('/:id', articleController.delete);

module.exports = router;