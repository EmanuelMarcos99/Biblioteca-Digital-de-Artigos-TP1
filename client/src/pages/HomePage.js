import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import DocumentCard from '../components/DocumentCard';
import api from '../services/api'; // Importar o nosso ficheiro de API

function HomePage() {
  const [documents, setDocuments] = useState([]); // Estado para guardar os artigos da API
  const [allDocuments, setAllDocuments] = useState([]); // Guarda todos os artigos para o autocomplete
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Estado para mostrar feedback de carregamento
  const [error, setError] = useState(null); // Estado para guardar mensagens de erro

  // useEffect para buscar os dados da API quando o componente é montado
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // ATENÇÃO: A rota no backend é /api/articles, não /api/artigos
        const response = await api.get('/articles'); 
        setDocuments(response.data);
        setAllDocuments(response.data); // Guarda a lista completa para o autocomplete
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os documentos. Tente novamente mais tarde.');
        console.error("Erro ao buscar artigos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []); // O array vazio [] significa que este efeito corre apenas uma vez

  // A lógica de filtro agora opera sobre o estado 'documents'
  useEffect(() => {
    if (!searchTerm) {
      setDocuments(allDocuments); // Se a busca estiver vazia, mostra todos
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

