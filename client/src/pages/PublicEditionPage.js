import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Importar o nosso serviço de API
import './style/PublicEditionPage.css';

function PublicEditionPage() {
  const { eventSlug, editionYear } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEditionData = async () => {
      try {
        setLoading(true);
        // A rota no backend é /api/events/slug/:slug/:year
        const response = await api.get(`/events/slug/${eventSlug}/${editionYear}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Edição não encontrada ou falha ao carregar os dados.');
        console.error("Erro ao buscar dados da edição:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventSlug && editionYear) {
      fetchEditionData();
    }
  }, [eventSlug, editionYear]);

  if (loading) {
    return <main className="container"><p>A carregar edição...</p></main>;
  }

  if (error || !data) {
    return (
      <main className="container">
        <div className="public-page">
          <h1>Edição não encontrada</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const { event, edition } = data;

  return (
    <main className="container">
      <div className="public-page edition-page">
        <h1>{edition.name || `${event.name} - ${edition.year}`}</h1>
        <p className="edition-location">{edition.location}</p>
        
        <h2>Artigos Publicados</h2>
        {edition.articles && edition.articles.length > 0 ? (
          <ul className="articles-list">
            {edition.articles.map(article => (
              <li key={article.id}>
                <p>{article.title}</p> 
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum artigo cadastrado para esta edição.</p>
        )}

        <Link to={`/events/slug/${eventSlug}`} className="back-link">
          &larr; Voltar para todas as edições de {event.name}
        </Link>
      </div>
    </main>
  );
}

export default PublicEditionPage;

