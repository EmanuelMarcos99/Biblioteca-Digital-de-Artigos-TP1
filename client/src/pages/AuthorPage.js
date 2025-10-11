import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api'; // Importar o nosso serviço de API
import './style/AuthorPage.css';

function AuthorPage() {
  const { authorName } = useParams();
  const [articlesByYear, setArticlesByYear] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const decodedAuthorName = decodeURIComponent(authorName);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        // A rota no backend é /api/authors/:authorName/articles
        const response = await api.get(`/authors/${authorName}/articles`);
        setArticlesByYear(response.data.articles);
        setError(null);
      } catch (err) {
        setError(`Nenhum artigo encontrado para o autor: ${decodedAuthorName}`);
        console.error("Erro ao buscar dados do autor:", err);
      } finally {
        setLoading(false);
      }
    };

    if (authorName) {
      fetchAuthorData();
    }
  }, [authorName, decodedAuthorName]);

  const sortedYears = Object.keys(articlesByYear).sort((a, b) => b - a);

  if (loading) {
    return <main className="container"><p>A carregar artigos do autor...</p></main>;
  }

  return (
    <main className="container">
      <div className="public-page author-page">
        <h1>Artigos de: {decodedAuthorName}</h1>

        {error && <p>{error}</p>}
        
        {!error && sortedYears.length > 0 ? (
          sortedYears.map(year => (
            <section key={year} className="year-section">
              <h2>{year}</h2>
              <ul className="author-articles-list">
                {articlesByYear[year].map(article => (
                  <li key={article.id}>{article.title}</li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          !loading && !error && <p>Nenhum artigo encontrado para este autor.</p>
        )}
      </div>
    </main>
  );
}

export default AuthorPage;

