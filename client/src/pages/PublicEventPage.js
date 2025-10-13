import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Importar o nosso serviço de API
import './style/PublicEventPage.css';

function PublicEventPage() {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        // A rota no backend é /api/events/slug/:slug
        const response = await api.get(`/events/slug/${eventSlug}`);
        setEvent(response.data);
        setError(null);
      } catch (err) {
        setError('Evento não encontrado ou falha ao carregar os dados.');
        console.error("Erro ao buscar dados do evento:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventSlug) {
      fetchEventData();
    }
  }, [eventSlug]);

  if (loading) {
    return <main className="container"><p>A carregar evento...</p></main>;
  }

  if (error || !event) {
    return (
      <main className="container">
        <div className="public-page">
          <h1>Evento não encontrado</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="public-page event-page">
        <h1>{event.name}</h1>
        <p className="event-description">{event.description}</p>
        
        <h2>Edições Anteriores</h2>
        {event.editions && event.editions.length > 0 ? (
          <ul className="editions-list">
            {event.editions.map(edition => (
              <li key={edition.id}>
                {/* A rota no frontend é /events/slug/:eventSlug/:editionYear */}
                <Link to={`/events/slug/${eventSlug}/${edition.year}`}>
                  {edition.name || `${event.name} ${edition.year}`} - {edition.location}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma edição cadastrada para este evento.</p>
        )}
      </div>
    </main>
  );
}

export default PublicEventPage;

