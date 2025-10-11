const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const eventController = {
  // GET /events - Lista todos os eventos
  getAll: async (req, res) => {
    try {
      // CORREÇÃO: Usar o nome da tabela em inglês
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /events - Cria um novo evento
  create: async (req, res) => {
    // CORREÇÃO: Usar os nomes dos campos em inglês
    const { name, description, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e slug do evento são obrigatórios.' });
    }
    try {
      // CORREÇÃO: Usar os nomes da tabela e colunas em inglês
      const { data, error } = await supabase
        .from('events')
        .insert([{ name, description, slug }])
        .select();
      if (error) {
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

  // PUT /events/:id - Atualiza evento
  update: async (req, res) => {
    const { id } = req.params;
    // CORREÇÃO: Usar os nomes dos campos em inglês
    const { name, description, slug } = req.body;

    if (!name && !description && !slug) {
      return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' });
    }

    try {
      // CORREÇÃO: Usar os nomes da tabela e colunas em inglês
      const { data, error } = await supabase
        .from('events')
        .update({ name, description, slug })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Evento não encontrado para o ID fornecido.' });
      }
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /events/:id - Deleta evento
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      // CORREÇÃO: Usar o nome da tabela em inglês
      const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Evento não encontrado para o ID fornecido.' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Home Page de Evento
  getEventHomePage: async (req, res) => {
    const { slug } = req.params;
    try {
      // ATENÇÃO: Verifique se o nome da tabela de edições é 'event_editions'
      const { data, error } = await supabase
        .from('events') // CORREÇÃO
        .select('*, editions:event_editions(*)') // SUGESTÃO: 'editions:event_editions(*)'
        .eq('slug', slug)
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Rota: POST /events/:eventId/editions
  createEdition: async (req, res) => {
    const { eventId } = req.params;
    // ATENÇÃO: Verifique se os nomes das colunas são 'year' e 'location'
    const { year, location } = req.body;

    if (!year) {
      return res.status(400).json({ error: 'O ano da edição é obrigatório.' });
    }

    try {
      // ATENÇÃO: Verifique se o nome da tabela de edições é 'event_editions'
      const { data, error } = await supabase
        .from('event_editions') // SUGESTÃO
        .insert([{
          event_id: eventId,
          year,
          location
        }])
        .select();

      if (error) {
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

  // Rota: GET /events/:eventId/editions
  getAllEditions: async (req, res) => {
    const { eventId } = req.params;
    try {
      // ATENÇÃO: Verifique se o nome da tabela de edições é 'event_editions'
      const { data, error } = await supabase
        .from('event_editions') // SUGESTÃO
        .select('*')
        .eq('event_id', eventId)
        .order('year', { ascending: false }); // SUGESTÃO: 'year'

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = eventController;
