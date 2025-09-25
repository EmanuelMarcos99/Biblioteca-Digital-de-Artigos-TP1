import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './style/PublicEventPage.css';

// --- Dados de Exemplo (Virão da API) ---
const mockEventsData = {
  sbrc: {
    name: 'Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos (SBRC)',
    description: 'O SBRC é o mais importante evento científico sobre redes de computadores e sistemas distribuídos do Brasil.',
    editions: [
      { year: 2023, city: 'Brasília' },
      { year: 2022, city: 'Fortaleza' },
    ]
  },
  sbbd: {
    name: 'Simpósio Brasileiro de Banco de Dados (SBBD)',
    description: 'O SBBD é o principal fórum da comunidade de banco de dados no Brasil.',
    editions: [
      { year: 2022, city: 'Búzios' },
    ]
  },
  sbseg: {
    name: 'Simpósio Brasileiro de Segurança da Informação e de Sistemas Computacionais (SBSeg)',
    description: 'O SBSeg aborda temas de pesquisa e aplicações em segurança da informação.',
    editions: [
        { year: 2023, city: 'Porto Alegre' },
    ]
  },
  wscad: {
      name: 'Simpósio em Sistemas Computacionais de Alto Desempenho (WSCAD)',
      description: 'O WSCAD é um evento de destaque na área de arquitetura de computadores, processamento de alto desempenho e sistemas distribuídos.',
      editions: [
          { year: 2021, city: 'Online' },
      ]
  }
};
// --- Fim dos Dados de Exemplo ---

function PublicEventPage() {
  const { eventSlug } = useParams();
  const event = mockEventsData[eventSlug];

  if (!event) {
    return (
      <main className="container">
        <div className="public-page">
          <h1>Evento não encontrado</h1>
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
        <ul className="editions-list">
          {event.editions.map(edition => (
            <li key={edition.year}>
              <Link to={`/eventos/${eventSlug}/${edition.year}`}>
                {event.name} {edition.year} - {edition.city}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default PublicEventPage;

