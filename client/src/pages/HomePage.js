import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import DocumentCard from '../components/DocumentCard';
import api from '../services/api';
import './style/HomePage.css'; // Importar o novo CSS

function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/articles'); 
        setDocuments(response.data);
        setAllDocuments(response.data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os documentos. Tente novamente mais tarde.');
        console.error("Erro ao buscar artigos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setDocuments(allDocuments);
      return;
    }
    const filtered = allDocuments.filter(doc =>
      (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.authors && doc.authors.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.publication && doc.publication.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setDocuments(filtered);
  }, [searchTerm, allDocuments]);


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <main className="container">
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange}
          allDocuments={allDocuments} 
        />
        
        <section className="results-section">
          <h2>Publicações Recentes</h2>
          
          {loading && <p>A carregar publicações...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          {!loading && !error && (
            <div className="document-list">
              {documents.length > 0 ? (
                documents.map(doc => (
                  <DocumentCard 
                    key={doc.id} 
                    doc={doc} 
                    searchTerm={searchTerm}
                  />
                ))
              ) : (
                <p>Nenhuma publicação encontrada.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default HomePage;

