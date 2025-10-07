import React from 'react';
import { useParams } from 'react-router-dom';
import './style/AuthorPage.css';

// --- Dados de Exemplo (Virão da API) ---
// No mundo real, faria uma chamada à API para buscar os artigos deste autor
const mockDocuments = [
    { id: 1, title: 'Uma Abordagem Baseada em Aprendizado Profundo para Detecção de Anomalias em Redes', authors: 'João Silva, Maria Oliveira', year: 2023 },
    { id: 2, title: 'Análise de Desempenho de Algoritmos de Banco de Dados em Grafos', authors: 'Carlos Pereira, Ana Souza', year: 2022 },
    { id: 3, title: 'Segurança em Sistemas de Votação Eletrônica: Desafios e Propostas', authors: 'Beatriz Costa, Emanuel Figueiredo', year: 2023 },
    { id: 4, title: 'Otimização de Compiladores para Arquiteturas de Múltiplos Núcleos', authors: 'Ezequiel Moreira, Ricardo Lima', year: 2021 },
    { id: 5, title: 'Novas Técnicas de Visualização de Dados para Big Data', authors: 'João Silva, Ana Souza', year: 2022 },
];
// --- Fim dos Dados de Exemplo ---

function AuthorPage() {
  const { authorName } = useParams();
  const decodedAuthorName = decodeURIComponent(authorName);

  // Filtra todos os documentos para encontrar aqueles que incluem o nome do autor
  const authorArticles = mockDocuments.filter(doc =>
    doc.authors.split(',').map(a => a.trim()).includes(decodedAuthorName)
  );

  // Agrupa os artigos por ano
  const articlesByYear = authorArticles.reduce((acc, article) => {
    const year = article.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(article);
    return acc;
  }, {});

  // Ordena os anos em ordem decrescente
  const sortedYears = Object.keys(articlesByYear).sort((a, b) => b - a);

  return (
    <main className="container">
      <div className="public-page author-page">
        <h1>Artigos de: {decodedAuthorName}</h1>

        {sortedYears.length > 0 ? (
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
          <p>Nenhum artigo encontrado para este autor.</p>
        )}
      </div>
    </main>
  );
}

export default AuthorPage;

