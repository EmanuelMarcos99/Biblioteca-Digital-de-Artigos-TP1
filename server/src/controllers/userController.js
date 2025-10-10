const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// Inicializar cliente do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const userController = {
  async register(req, res) {
    const { name, email, password } = req.body;
    
    try {
      // Verificar se o usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Inserir novo usuário
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            name, 
            email, 
            password: hashedPassword 
          }
        ])
        .select();

      if (error) throw error;
      
      res.status(201).json({ 
        message: 'Usuário criado com sucesso',
        user: { id: data[0].id, name: data[0].name, email: data[0].email }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;
    try {
      // Buscar usuário pelo email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Senha inválida' });
      }
      // Gerar token JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ 
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Métodos adicionais úteis:
  async getProfile(req, res) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('id', req.user.id)
        .single();

      if (error) throw error;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProfile(req, res) {
    const { name, email } = req.body;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', req.user.id)
        .select('id, name, email');

      if (error) throw error;
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Novo método para POST /usuarios/subscribe (Sprint 8)
    subscribe: async (req, res) => {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'O email é obrigatório para a subscrição.' });
        }

        try {
            // Assumindo que a tabela 'subscribers' armazena emails para notificação
            const { data, error } = await supabase
                .from('subscribers')
                .upsert({ email, subscribed_at: new Date() }, { onConflict: 'email', ignoreDuplicates: false })
                .select();

            if (error) throw error;

            res.status(201).json({ 
                message: 'Subscrição realizada com sucesso. Você receberá notificações de novos artigos.',
                subscriber: data[0]
            });
        } catch (error) {
            // Exemplo de erro de email inválido ou falha no DB
            res.status(500).json({ error: error.message });
        }
    },
    
    // Método auxiliar para buscar todos os emails subscritos (para uso no articleController)
    getSubscribers: async () => {
        try {
            const { data, error } = await supabase
                .from('subscribers')
                .select('email');
            
            if (error) throw error;
            return data.map(sub => sub.email);
        } catch (error) {
            console.error('Erro ao buscar inscritos para notificação:', error.message);
            return [];
        }
    }

};

module.exports = userController;