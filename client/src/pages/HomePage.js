import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import DocumentCard from '../components/DocumentCard';

// Os dados de exemplo foram movidos para cá por enquanto
const mockDocuments = [
  {
    id: 1,
    title: 'Uma Abordagem Baseada em Aprendizado Profundo para Detecção de Anomalias em Redes',
    authors: 'João Silva, Maria Oliveira',
    publication: 'Anais do Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos (SBRC)',
    year: 2023,
    url: '#'
  },
  {
    id: 2,
    title: 'Análise de Desempenho de Algoritmos de Banco de Dados em Grafos',
    authors: 'Carlos Pereira, Ana Souza',
    publication: 'Anais do Simpósio Brasileiro de Banco de Dados (SBBD)',
    year: 2022,
    url: '#'
  },
  {
    id: 3,
    title: 'Segurança em Sistemas de Votação Eletrônica: Desafios e Propostas',
    authors: 'Beatriz Costa, Emanuel Figueiredo',
    publication: 'Anais do Simpósio Brasileiro de Segurança da Informação e de Sistemas Computacionais (SBSeg)',
    year: 2023,
    url: '#'
  },
  {
    id: 4,
    title: 'Otimização de Compiladores para Arquiteturas de Múltiplos Núcleos',
    authors: 'Ezequiel Moreira, Ricardo Lima',
    publication: 'Anais do Simpósio em Sistemas Computacionais de Alto Desempenho (WSCAD)',
    year: 2021,
    url: '#'
  }
];

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.authors.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container">
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      <section className="results-section">
        <h2>Publicações Recentes</h2>
        <div className="document-list">
          {filteredDocuments.map(doc => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
