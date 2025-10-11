require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const userController = require('./userController'); // Assumindo que está no mesmo diretório

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// MOCK: Função de Simulação de Parsing BibTeX
function parseBibtex(bibtexContent) {
    const entryCount = (bibtexContent.match(/@\w+\s*{/g) || []).length;
    const parsedArticles = [];
    if (entryCount === 0) return [];
    for (let i = 1; i <= entryCount; i++) {
        parsedArticles.push({
            title: `Artigo Importado via BibTeX #${i}`,
            authors: `Autor Bib #${i}`,
            abstract: `Resumo extraído do arquivo #${i}.`,
        });
    }
    return parsedArticles;
}

async function sendNotificationEmail(articleTitle, subscribers) {
    if (subscribers.length === 0) {
        console.log('Nenhum assinante para notificar.');
        return;
    }
    console.log(`Simulando envio de e-mail sobre o novo artigo: "${articleTitle}" para ${subscribers.length} destinatários.`);
}

const articleController = {
    getAll: async (req, res) => {
        const { search } = req.query; 
        try {
            let query = supabase.from('articles').select('*');
            if (search) {
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
        const BUCKET_NAME = 'articles_pdfs';

        if (!title || !authors || !edition_id || !abstract || !uploadedFile) { 
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            return res.status(400).json({ error: 'Título, autores, ID da edição, abstract e o arquivo PDF são obrigatórios.' });
        }

        try {
            const fileContent = fs.readFileSync(uploadedFile.path);
            const mimeType = uploadedFile.mimetype || 'application/pdf'; 
            const storagePath = `public/${uploadedFile.filename}`; 

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(storagePath, fileContent, {
                    contentType: mimeType,
                    upsert: false
                });
            
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(storagePath);
            const fileUrl = publicUrlData.publicUrl;

            const { data: insertData, error: insertError } = await supabase
                .from('articles')
                .insert([{ 
                    title, 
                    authors,
                    abstract,
                    event_edition_id: edition_id, 
                    pdf_url: fileUrl,
                }])
                .select();

            if (insertError) throw insertError;

            if (fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            
            res.status(201).json(insertData[0]);
        } catch (error) {
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            console.error('ERRO DETALHADO DO SUPABASE AO CRIAR ARTIGO:', error);
            res.status(500).json({ error: 'Falha no upload ou inserção: ' + error.message });
        }
    },
    
    importBibtex: async (req, res) => {
        const { edition_id } = req.body;
        const uploadedFile = req.file;

        if (!edition_id || !uploadedFile) {
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            return res.status(400).json({ error: 'ID da edição e o arquivo BibTeX são obrigatórios.' });
        }

        let newArticles = [];
        try {
            const bibtexContent = fs.readFileSync(uploadedFile.path, 'utf8');
            const parsedArticles = parseBibtex(bibtexContent);
            
            if (parsedArticles.length === 0) {
                 return res.status(400).json({ message: 'Nenhuma entrada válida encontrada no arquivo BibTeX.' });
            }

            // --- CORREÇÃO FINAL: Usar o nome correto da coluna ---
            const articlesToInsert = parsedArticles.map(article => ({
                ...article,
                event_edition_id: edition_id 
            }));

            const { data, error } = await supabase
                .from('articles')
                .insert(articlesToInsert)
                .select();

            if (error) throw error;
            newArticles = data;

            if (fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }

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
            if (uploadedFile && fs.existsSync(uploadedFile.path)) {
                fs.unlinkSync(uploadedFile.path); 
            }
            res.status(500).json({ error: error.message || 'Erro durante a importação do BibTeX' });
        }
    },
    
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
        // --- CORREÇÃO FINAL: Usar o nome correto da coluna ---
        if (edition_id) updateData.event_edition_id = edition_id;
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

