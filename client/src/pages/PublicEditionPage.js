import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './style/PublicEditionPage.css';

// --- Dados de Exemplo (Virão da API) ---
const mockEditionsData = {
  sbrc: {
    2023: {
      eventName: 'Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos',
      articles: [
        { id: 1, title: 'Uma Abordagem Baseada em Aprendizado Profundo para Detecção de Anomalias em Redes', authors: 'João Silva, Maria Oliveira' },
        { id: 3, title: 'Segurança em Sistemas de Votação Eletrônica: Desafios e Propostas', authors: 'Beatriz Costa, Emanuel Figueiredo' }
      ]
    },
    2022: {
        eventName: 'Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos',
        articles: [
            { id: 5, title: 'Artigo Exemplo SBRC 2022', authors: 'Autor Exemplo' }
        ]
    }
  },
  sbbd: {
    2022: {
      eventName: 'Simpósio Brasileiro de Banco de Dados',
      articles: [
        { id: 2, title: 'Análise de Desempenho de Algoritmos de Banco de Dados em Grafos', authors: 'Carlos Pereira, Ana Souza' }
      ]
    }
  },
  sbseg: {
      2023: {
          eventName: 'Simpósio Brasileiro de Segurança da Informação e de Sistemas Computacionais',
          articles: [
              { id: 6, title: 'Artigo Exemplo SBSeg 2023', authors: 'Autor Exemplo' }
          ]
      }
  },
  wscad: {
      2021: {
          eventName: 'Simpósio em Sistemas Computacionais de Alto Desempenho',
          articles: [
              { id: 4, title: 'Otimização de Compiladores para Arquiteturas de Múltiplos Núcleos', authors: 'Ezequiel Moreira, Ricardo Lima' }
          ]
      }
  }
};
// --- Fim dos Dados de Exemplo ---

function PublicEditionPage() {
  const { eventSlug, editionYear } = useParams();
  const edition = mockEditionsData[eventSlug]?.[editionYear];

  if (!edition) {
    return (
      <main className="container">
        <div className="public-page">
          <h1>Edição não encontrada</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="public-page edition-page">
        <h1>{edition.eventName} - {editionYear}</h1>
        
        <h2>Artigos Publicados</h2>
        <ul className="articles-list">
          {edition.articles.map(article => (
            <li key={article.id}>
              {/* No futuro, este será um link para a página do artigo */}
              <p className="article-title">{article.title}</p> 
              <p className="article-authors">{article.authors}</p>
            </li>
          ))}
        </ul>

        <Link to={`/eventos/${eventSlug}`} className="back-link">
          &larr; Voltar para todas as edições de {eventSlug.toUpperCase()}
        </Link>
      </div>
    </main>
  );
}

export default PublicEditionPage;

