import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Importar o nosso serviço de API
import './style/BibtexImportPage.css';

function BibtexImportPage() {
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Busca inicial das edições para preencher o <select>
  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const eventsResponse = await api.get('/events');
        const allEditions = eventsResponse.data.flatMap(event =>
          Array.isArray(event.editions) ? event.editions.map(edition => ({
            ...edition,
            eventName: event.name,
          })) : []
        );
        setEditions(allEditions);
      } catch (err) {
        setError('Falha ao carregar a lista de edições.');
        console.error("Erro ao buscar edições:", err);
      }
    };
    fetchEditions();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleEditionChange = (e) => {
    setSelectedEdition(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedEdition) {
      setError('Por favor, selecione uma edição e um ficheiro BibTeX.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('bibtexFile', selectedFile);
    formData.append('edition_id', selectedEdition);

    try {
      // A rota no backend é /api/articles/import-bibtex
      const response = await api.post('/articles/import-bibtex', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message); // Exibe a mensagem de sucesso do backend
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro durante a importação.';
      setError(errorMessage);
      console.error("Erro na importação BibTeX:", err);
    } finally {
      setLoading(false);
      // Limpa os campos após a submissão
      setSelectedFile(null);
      setSelectedEdition('');
      document.getElementById('bibtexFileInput').value = '';
    }
  };

  return (
    <main className="container">
      <div className="import-page">
        <h1>Importação em Massa via BibTeX</h1>
        <p>Selecione a edição do evento e o ficheiro .bib para importar múltiplos artigos de uma só vez.</p>
        
        <form onSubmit={handleSubmit} className="import-form card">
          <div className="form-group">
            <label htmlFor="editionSelect">Edição do Evento de Destino:</label>
            <select id="editionSelect" value={selectedEdition} onChange={handleEditionChange} required>
              <option value="">Selecione uma edição...</option>
              {editions.map(edition => (
                <option key={edition.id} value={edition.id}>
                  {edition.eventName} - {edition.name} ({edition.year})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bibtexFileInput">Ficheiro BibTeX (.bib):</label>
            <input id="bibtexFileInput" type="file" onChange={handleFileChange} accept=".bib" required />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'A Importar...' : 'Importar Artigos'}
          </button>
        </form>

        {message && <p className="success-message card">{message}</p>}
        {error && <p className="error-message card">{error}</p>}

      </div>
    </main>
  );
}

export default BibtexImportPage;

