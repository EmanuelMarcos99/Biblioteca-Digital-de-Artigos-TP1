const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const editionController = {
  // PUT /editions/:id
  update: async (req, res) => {
    const { id } = req.params;
    // CORREÇÃO: Aceitar todos os campos editáveis da base de dados em inglês
    const { year, name, description, slug, location, start_date, end_date } = req.body;
    
    const updateData = {};
    if (year) updateData.year = year;
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (slug) updateData.slug = slug;
    if (location) updateData.location = location;
    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido fornecido para atualização.' });
    }

    try {
      // CORREÇÃO: Usar o nome da tabela em inglês
      const { data, error } = await supabase
        .from('event_editions')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Edição não encontrada para o ID fornecido.' });
      }
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /editions/:id
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      // CORREÇÃO: Usar o nome da tabela em inglês
      const { data, error } = await supabase
        .from('event_editions')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Edição não encontrada para o ID fornecido.' });
      }
      res.status(204).send();
    } catch (error) {
      if (error.code === '23503') {
        return res.status(409).json({ error: 'Não é possível excluir a edição porque ela possui artigos vinculados.' });
      }
      res.status(500).json({ error: error.message });
    }
  },
  
  // GET /events/:slug/:year
  getEditionHomePage: async (req, res) => {
    const { slug, year } = req.params;
    try {
      // CORREÇÃO: Selecionar mais campos para enriquecer a página pública
      const selectQuery = `
        id, name, 
        editions:event_editions!inner(id, year, name, description, location, start_date, end_date, articles:articles(*))
      `;
      
      const { data, error } = await supabase
        .from('events')
        .select(selectQuery)
        .eq('slug', slug)
        .eq('editions.year', year)
        .single();

      if (error) throw error;
      if (!data || !data.editions || data.editions.length === 0) return res.status(404).json({ error: 'Edição não encontrada' });
      
      res.json({ event: { id: data.id, name: data.name }, edition: data.editions[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = editionController;

