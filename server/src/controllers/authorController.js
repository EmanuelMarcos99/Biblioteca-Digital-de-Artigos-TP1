const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Função auxiliar para agrupar artigos por ano
const groupArticlesByYear = (articles) => {
  return articles.reduce((acc, article) => {
    // A query agora busca o 'year' diretamente da tabela de edições.
    const year = article.event_editions?.year || 'Ano Desconhecido';
    
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(article);
    return acc;
  }, {});
};

const authorController = {
  // GET /authors/:authorName/articles
  getArticlesByAuthor: async (req, res) => {
    const authorName = decodeURIComponent(req.params.authorName);
    
    try {
      // --- CORREÇÃO FINAL: Usar 'ilike' para a busca e os nomes corretos das tabelas ---
      const { data: articles, error } = await supabase
        .from('articles')
        .select(`
          id, 
          title, 
          authors,
          event_editions ( year ) // Busca o ano da tabela de edições relacionada
        `)
        // 'ilike' faz uma busca de texto que não é sensível a maiúsculas/minúsculas
        .ilike('authors', `%${authorName}%`); 
      
      if (error) throw error;

      if (!articles || articles.length === 0) {
        return res.status(404).json({ message: `Nenhum artigo encontrado para o autor: ${authorName}` });
      }
      
      // Agrupa os artigos por ano
      const groupedArticles = groupArticlesByYear(articles);

      res.json({
        author: authorName,
        articles: groupedArticles
      });
      
    } catch (error) {
      // Adicionado para depuração no terminal do backend
      console.error('ERRO DETALHADO DO SUPABASE AO BUSCAR AUTOR:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authorController;
