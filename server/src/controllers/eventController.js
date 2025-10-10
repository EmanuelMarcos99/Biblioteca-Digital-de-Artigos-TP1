const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const eventController = {
 // GET /eventos - Lista todos os eventos (Sprint 1)
    getAll: async (req, res) => {
        try {
            // Busca todos os campos de todos os eventos
            const { data, error } = await supabase
                .from('eventos')
                .select('*');

            if (error) throw error;
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // POST /eventos - Cria um novo evento (Sprint 1)
    create: async (req, res) => {
        const { nome, descricao, slug } = req.body;
        // Simples validação de campos obrigatórios
        if (!nome || !slug) {
            return res.status(400).json({ error: 'Nome e slug do evento são obrigatórios.' });
        }
        try {
            const { data, error } = await supabase
                .from('eventos')
                .insert([{ nome, descricao, slug }])
                .select(); // Retorna o objeto recém-criado
            if (error) {
                // Se o erro for por slug duplicado, retorna 409 Conflict
                if (error.code === '23505') { 
                     return res.status(409).json({ error: 'O slug fornecido já está em uso.' });
                }
                throw error;
            }
            res.status(201).json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // PUT /eventos/:id - Atualiza evento (Sprint 1)
    update: async (req, res) => {
        const { id } = req.params;
        const { nome, descricao, slug } = req.body;
        
        // Verifica se pelo menos um campo está sendo enviado para atualização
        if (!nome && !descricao && !slug) {
            return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' });
        }

        try {
            const { data, error } = await supabase
                .from('eventos')
                .update({ nome, descricao, slug })
                .eq('id', id)
                .select(); // Retorna o objeto atualizado

            if (error) throw error;

            if (data.length === 0) {
                return res.status(404).json({ error: 'Evento não encontrado para o ID fornecido.' });
            }

            res.json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /eventos/:id - Deleta evento (Sprint 1)
    delete: async (req, res) => {
        const { id } = req.params;

        try {
            const { data, error } = await supabase
                .from('eventos')
                .delete()
                .eq('id', id)
                .select(); // Usado para checar se algo foi deletado

            if (error) throw error;

            if (data.length === 0) {
                return res.status(404).json({ error: 'Evento não encontrado para o ID fornecido.' });
            }
            
            // Retorna 204 No Content para indicar sucesso na exclusão
            res.status(204).send(); 
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },


    // Home Page de Evento (Sprint 6)
    getEventHomePage: async (req, res) => {
        const { slug } = req.params;
        // Lógica para retornar evento + edições (dados agregados)
        try {
            const { data, error } = await supabase
                .from('eventos')
                .select('*, edicoes:edicoes_eventos(*)')
                .eq('slug', slug)
                .single();
            if (error) throw error;
            if (!data) return res.status(404).json({ error: 'Evento não encontrado' });
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
// Rota: POST /eventos/:eventId/edicoes
    createEdition: async (req, res) => {
        const { eventId } = req.params;
        const { ano, local } = req.body;
        
        if (!ano) {
            return res.status(400).json({ error: 'O ano da edição é obrigatório.' });
        }

        try {
            // Insere a nova edição, vinculando-a ao eventId recebido
            const { data, error } = await supabase
                .from('edicoes_eventos')
                .insert([{ 
                    event_id: eventId, 
                    ano, 
                    local 
                }])
                .select(); 

            if (error) {
                // Pode incluir verificação se eventId existe (Foreign Key Constraint)
                if (error.code === '23503') {
                    return res.status(404).json({ error: `Evento com ID ${eventId} não encontrado.` });
                }
                throw error;
            }

            res.status(201).json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Rota: GET /eventos/:eventId/edicoes
    getAllEditions: async (req, res) => {
        const { eventId } = req.params;

        try {
            // Busca todas as edições filtrando pelo ID do evento
            const { data, error } = await supabase
                .from('edicoes_eventos')
                .select('*')
                .eq('event_id', eventId) // Filtra todas as edições que pertencem a este evento
                .order('ano', { ascending: false }); // Ordena pelo ano decrescente

            if (error) throw error;
            
            // Retorna a lista de edições (pode ser vazia se o evento não tiver edições)
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
};

module.exports = eventController;