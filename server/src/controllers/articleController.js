require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const nodemailer = require('nodemailer');
const fs = require('fs'); // Módulo do Node.js para manipulação de arquivos

// Inicializar cliente do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);


// MOCK: Função de Simulação de Parsing BibTeX (Substitua pela sua lógica real)
function parseBibtex(bibtexContent) {
    // ... Implementação real do parser (usando '@orcid/bibtex-parse-js' ou similar) ...
    const entryCount = (bibtexContent.match(/@\w+\s*{/g) || []).length;
    const parsedArticles = [];
    
    if (entryCount === 0) return [];
    
    for (let i = 1; i <= entryCount; i++) {
        parsedArticles.push({
            title: `Artigo Importado via BibTeX #${i}`,
            authors: `Autor Bib #${i}`,
            edition_id: null, // Será preenchido com req.body.edition_id
            content: `Conteúdo lido do arquivo BibTeX.`,
            abstract: `Resumo extraído do arquivo.`,
            file_path: 'URL_do_Artigo_no_Storage_se_existir'
        });
    }
    return parsedArticles;
}

async function sendNotificationEmail(articleTitle, subscribers) {
    if (subscribers.length === 0) {
        console.log('Nenhum assinante para notificar.');
        return;
    }
    // *** Implementação Real do Nodemailer Faltante ***
    // Exemplo de logging (simulação)
    console.log(`Simulando envio de e-mail sobre o novo artigo: "${articleTitle}" para ${subscribers.length} destinatários.`);
    // console.log('Destinatários:', subscribers);
    try {
        let transporter = nodemailer.createTransport({ /* ... configurações SMTP ... */ });
        
        let info = await transporter.sendMail({
            from: '"Seu Nome" <seuemail@dominio.com>', 
            to: subscribers.join(', '), 
            subject: "Novo Artigo Disponibilizado!",
            text: `O novo artigo "${articleTitle}" foi adicionado ao nosso repositório.`, 
            html: `<b>O novo artigo "${articleTitle}" foi adicionado ao nosso repositório.</b>`,
        });
        console.log("Email enviado: %s", info.messageId);
    } catch (error) {
        console.error('Falha ao enviar e-mail de notificação:', error);
    }
}

const articleController = {
    // GET /artigos OU GET /artigos?search=... (Sprint 5)
    getAll: async (req, res) => {
        const { search } = req.query; 
        try {
            let query = supabase.from('articles').select('*');
            if (search) {
                // Implementação de busca usando ilike
                query = query.or(`title.ilike.%${search}%,authors.ilike.%${search}%`);
            }
            const { data, error } = await query;
            if (error) throw error;
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    create: async (req, res) => {
        const { title, authors, edition_id, abstract } = req.body;
        const uploadedFile = req.file; 
        const BUCKET_NAME = 'articles_pdfs'; // <-- Defina o nome do seu Bucket no Supabase Storage

        // --- Validação (Garante que o arquivo existe antes de tentar ler) ---
        if (!title || !authors || !edition_id || !abstract || !uploadedFile) { 
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            return res.status(400).json({ error: 'Título, autores, ID da edição, abstract e o arquivo PDF são obrigatórios.' });
        }

        try {
            // 1. LER O ARQUIVO TEMPORÁRIO DO DISCO
            const fileContent = fs.readFileSync(uploadedFile.path);
            const mimeType = uploadedFile.mimetype || 'application/pdf'; 
            
            // 2. DEFINIR O CAMINHO DE UPLOAD NO SUPABASE STORAGE
            // Ex: public/pdfFile-1734204859874-90184712.pdf
            const storagePath = `public/${uploadedFile.filename}`; 

            // 3. UPLOAD PARA O SUPABASE STORAGE
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(storagePath, fileContent, {
                    contentType: mimeType,
                    upsert: false // Não substitua se já existir
                });
            
            if (uploadError) throw uploadError;

            // 4. OBTER O URL PÚBLICO
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(storagePath);

            const fileUrl = publicUrlData.publicUrl; // ESTE É O URL FINAL

            // 5. INSERÇÃO NO BANCO DE DADOS
            const { data: insertData, error: insertError } = await supabase
                .from('articles')
                .insert([
                    { 
                        title, 
                        authors,
                        abstract,
                        // Mapeamento correto para a coluna de chave estrangeira:
                        event_edition_id: edition_id, 
                        pdf_url: fileUrl, // <--- SALVA O URL PÚBLICO
                        content: 'Arquivo PDF carregado no Storage.' 
                    }
                ])
                .select();

            if (insertError) throw insertError;

            // 6. LIMPEZA DO ARQUIVO TEMPORÁRIO
            if (fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            
            res.status(201).json(insertData[0]);

        } catch (error) {
            // Limpeza em caso de falha (mesmo se o erro for do Supabase Storage)
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            console.error('ERRO DETALHADO DO SUPABASE AO CRIAR ARTIGO:', error);
            res.status(500).json({ error: 'Falha no upload ou inserção: ' + error.message });
        }
    },
    
    // POST /artigos/importar-bibtex - Importação em Massa com Arquivo BibTeX (Sprint 4 & 8)
    importBibtex: async (req, res) => {
        const { edition_id } = req.body; // ID da Edição para vincular os novos artigos
        const uploadedFile = req.file; // Arquivo BibTeX em req.file (nome 'bibtexFile' na rota)

        if (!edition_id || !uploadedFile) {
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            return res.status(400).json({ error: 'ID da edição e o arquivo BibTeX são obrigatórios.' });
        }

        let newArticles = [];
        try {
            // 1. Ler Conteúdo do Arquivo Temporário (MUITO IMPORTANTE!)
            // Lê o conteúdo do arquivo temporário do Multer como texto (utf8)
            const bibtexContent = fs.readFileSync(uploadedFile.path, 'utf8');

            // 2. Fazer o Parsing (usando a função Mock/Real)
            const parsedArticles = parseBibtex(bibtexContent);
            
            if (parsedArticles.length === 0) {
                 return res.status(400).json({ message: 'Nenhuma entrada válida encontrada no arquivo BibTeX.' });
            }

            // 3. Mapear e vincular o edition_id
            const articlesToInsert = parsedArticles.map(article => ({
                ...article,
                edition_id: edition_id 
            }));

            // 4. Persistir os novos artigos no Supabase (inserção em massa)
            const { data, error } = await supabase
                .from('articles')
                .insert(articlesToInsert)
                .select();

            if (error) throw error;
            newArticles = data;

            // 5. Limpeza do Arquivo Temporário
            if (fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }

            // 6. Notificação (Sprint 8)
            if (newArticles.length > 0) {
                const subscribers = await userController.getSubscribers();
                const message = newArticles.length === 1 
                    ? newArticles[0].title
                    : `Importação de ${newArticles.length} novos artigos`;
                    
                sendNotificationEmail(message, subscribers);
            }
            
            res.status(200).json({ 
                message: `Importação de BibTeX concluída. ${newArticles.length} artigos criados.`,
                articles_created: newArticles
            });
        } catch (error) {
             // Limpeza em caso de falha no DB
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            res.status(500).json({ error: error.message || 'Erro durante a importação do BibTeX' });
        }
    },
    
    // CRUD por ID (Lógicas mantidas/atualizadas para o modelo)
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return res.status(404).json({ error: 'Artigo não encontrado.' });
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { title, authors, edition_id, abstract } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (authors) updateData.authors = authors;
        if (edition_id) updateData.edition_id = edition_id;
        if (abstract) updateData.abstract = abstract;
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' });
        }
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;
            if (data.length === 0) return res.status(404).json({ error: 'Artigo não encontrado.' });
            res.json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = articleController;