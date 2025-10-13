const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const eventController = {
  getAll: async (req, res) => {
    try {
      const { data, error } = await supabase.from('events').select('*, editions:event_editions(*)');
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Evento não encontrado.' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  create: async (req, res) => {
    const { name, description, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e slug do evento são obrigatórios.' });
    }
    try {
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

  update: async (req, res) => {
    const { id } = req.params;
    const { name, description, slug } = req.body;
    if (!name && !description && !slug) {
      return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' });
    }
    try {
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

  delete: async (req, res) => {
    const { id } = req.params;
    try {
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

  getEventHomePage: async (req, res) => {
    const { slug } = req.params;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, editions:event_editions(*)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // --- FUNÇÃO A SER ATUALIZADA NO BACKEND ---
  createEdition: async (req, res) => {
    const { eventId } = req.params;
    // --- CORREÇÃO: Aceitar os novos campos obrigatórios ---
    const { year, location, name, slug } = req.body;

    if (!year || !name || !slug) {
      return res.status(400).json({ error: 'Ano, Nome e Slug da edição são obrigatórios.' });
    }

    try {
      const { data, error } = await supabase
        .from('event_editions')
        .insert([{
          event_id: eventId,
          year,
          location,
          name, // <-- Adicionado
          slug  // <-- Adicionado
        }])
        .select();

      if (error) {
        if (error.code === '23503') { // Foreign Key
          return res.status(404).json({ error: `Evento com ID ${eventId} não encontrado.` });
        }
        if (error.code === '23505') { // Unique constraint (slug)
          return res.status(409).json({ error: 'O slug para esta edição já está em uso.' });
        }
        throw error;
      }
      res.status(201).json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  getAllEditions: async (req, res) => {
    const { eventId } = req.params;
    try {
      const { data, error } = await supabase
        .from('event_editions')
        .select('*')
        .eq('event_id', eventId)
        .order('year', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req, res) => {
        const { name, description, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ error: 'Nome e slug do evento são obrigatórios.' });
        }
        
        let newEventData; // Variável para armazenar os dados do evento criado

        try {
            // 1. CRIA O NOVO EVENTO
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

            newEventData = data[0]; // Guarda os dados do evento criado para o email

            // 2. BUSCA TODOS OS EMAILS DA TABELA 'subscribes'
            const { data: subscribers, error: subError } = await supabase
                .from('subscribes') // Assumindo o nome da tabela como 'subscribes'
                .select('email');

            if (subError) {
                console.error("Erro ao buscar inscritos para email:", subError.message);
                // NOTA: Não jogamos erro aqui para não falhar a criação do evento por causa do email
            }

            // 3. ENVIA O EMAIL DE NOTIFICAÇÃO
            if (subscribers && subscribers.length > 0) {
                // Mapeia a lista de objetos { email: '...' } para um array simples de strings ['email1', 'email2']
                const recipientEmails = subscribers.map(sub => sub.email); 
                
                // Envia o email. Isso deve ser feito de forma assíncrona para não bloquear a resposta.
                // É altamente recomendável envolver isso em um bloco try/catch real na sua função de envio.
                sendNotificationEmail(recipientEmails, newEventData);
            }
            
            // Retorna a resposta de sucesso APÓS a criação e o disparo do email
            res.status(201).json(newEventData);
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = eventController;