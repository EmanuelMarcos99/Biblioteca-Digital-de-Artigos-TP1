const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const editionController = {
    update: async (req, res) => {
        const { id } = req.params;
        const { ano, local, data_inicio } = req.body;
        
        // Objeto de dados para atualização, garantindo que apenas campos válidos sejam incluídos
        const updateData = {};
        if (ano) updateData.ano = ano;
        if (local) updateData.local = local;
        if (data_inicio) updateData.data_inicio = data_inicio; // Adicionando campo da tabela

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo válido fornecido para atualização.' });
        }

        try {
            const { data, error } = await supabase
                .from('edicoes_eventos')
                .update(updateData)
                .eq('id', id)
                .select(); // Retorna o objeto atualizado

            if (error) throw error;

            if (data.length === 0) {
                return res.status(404).json({ error: 'Edição não encontrada para o ID fornecido.' });
            }

            res.json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Rota: DELETE /edicoes/:id - Deleta edição (Sprint 2)
    delete: async (req, res) => {
        const { id } = req.params;

        try {
            const { data, error } = await supabase
                .from('edicoes_eventos')
                .delete()
                .eq('id', id)
                .select(); // Usado para verificar se algo foi excluído

            if (error) throw error;

            if (data.length === 0) {
                return res.status(404).json({ error: 'Edição não encontrada para o ID fornecido.' });
            }
            
            // Retorna 204 No Content para indicar sucesso na exclusão
            res.status(204).send(); 
        } catch (error) {
            // Se houver artigos ou outras entidades dependentes, o DB pode retornar um erro 409 (Foreign Key Constraint)
            if (error.code === '23503') {
                 return res.status(409).json({ error: 'Não é possível excluir a edição porque ela possui artigos vinculados.' });
            }
            res.status(500).json({ error: error.message });
        }
    },
    
    
    // Home Page de Edição (Sprint 6)
    // Rota: GET /eventos/:slug/:ano
    getEditionHomePage: async (req, res) => {
        const { slug, ano } = req.params;
        // Lógica para retornar Edição + Artigos (dados agregados)
        try {
            // Exemplo de query que busca o evento e filtra a edição pelo ano, retornando seus artigos
            const { data, error } = await supabase
                .from('eventos')
                .select(`id, nome, edicoes:edicoes_eventos!inner(id, ano, local, artigos:articles(*))`)
                .eq('slug', slug)
                .eq('edicoes_eventos.ano', ano) 
                .single();

            if (error) throw error;
            if (!data || !data.edicoes || data.edicoes.length === 0) return res.status(404).json({ error: 'Edição não encontrada' });
            
            res.json({ event: { id: data.id, nome: data.nome }, edition: data.edicoes[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = editionController;