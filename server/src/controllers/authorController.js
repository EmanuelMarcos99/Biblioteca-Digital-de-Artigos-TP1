const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Função auxiliar para agrupar artigos por ano
const groupArticlesByYear = (articles) => {
    return articles.reduce((acc, article) => {
        // Supondo que 'year' é um campo diretamente disponível ou é extraído da 'edition'
        // Para fins práticos, vamos simular a extração do ano se ele não for direto no artigo.
        // Se a tabela 'articles' não tiver 'year', isso precisa ser ajustado na query ou no modelo.
        const year = article.edition_year || 'Ano Desconhecido'; 
        
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(article);
        return acc;
    }, {});
};

const authorController = {
    // GET /autores/:authorName/artigos
    getArticlesByAuthor: async (req, res) => {
        // O nome do autor deve ser decodificado caso contenha espaços ou caracteres especiais na URL
        const authorName = decodeURIComponent(req.params.authorName);
        
        try {
            // No Supabase, se 'authors' for um array de strings ou texto contendo os autores:
            // Usamos 'cs' (contains) ou 'like' dependendo do formato do campo 'authors'.
            // Assumindo que 'authors' é uma string ou array (usando 'cs' ou 'like' com wildcards).
            const { data: articles, error } = await supabase
                .from('articles')
                .select(`
                    id, 
                    title, 
                    authors, 
                    edition_id, 
                    edition:edicoes_eventos(ano) // Assume que articles tem uma FK para edicoes_eventos
                `)
                .textSearch('authors', authorName); // Busca full-text ou 'ilike' para uma busca simples
            
            if (error) throw error;

            if (articles.length === 0) {
                return res.status(404).json({ message: `Nenhum artigo encontrado para o autor: ${authorName}` });
            }

            // Mapeia para incluir o ano da edição (se existir)
            const articlesWithYear = articles.map(article => ({
                ...article,
                edition_year: article.edition?.ano || null // Pega o campo 'ano' da edição
            }));
            
            // Agrupa os artigos por ano
            const groupedArticles = groupArticlesByYear(articlesWithYear);

            res.json({
                author: authorName,
                articles: groupedArticles
            });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authorController;