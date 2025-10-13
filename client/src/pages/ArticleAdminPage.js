import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './style/ArticleAdminPage.css';

function ArticleAdminPage() {
  const [articles, setArticles] = useState([]);
  const [editions, setEditions] = useState([]); // Para preencher o <select>
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    edition_id: '',
    abstract: '',
    pdfFile: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca inicial de artigos e edições
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const articlesResponse = await api.get('/articles');
        setArticles(articlesResponse.data);

        const eventsResponse = await api.get('/events');
        
        // --- MELHORIA: Tornar o código mais robusto ---
        // Verifica se event.editions é um array antes de o mapear
        const allEditions = eventsResponse.data.flatMap(event =>
          Array.isArray(event.editions) ? event.editions.map(edition => ({
            ...edition,
            eventName: event.name,
          })) : []
        );
        setEditions(allEditions);
        
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os dados da página. Verifique o backend.');
        console.error("Erro ao buscar dados de artigos/edições:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({ ...prevState, pdfFile: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.authors || !formData.edition_id || !formData.pdfFile) {
      alert('Todos os campos, incluindo o ficheiro PDF, são obrigatórios.');
      return;
    }

    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('authors', formData.authors);
    submissionData.append('edition_id', formData.edition_id);
    submissionData.append('abstract', formData.abstract);
    submissionData.append('pdfFile', formData.pdfFile);

    try {
      if (editingId) {
        alert('A funcionalidade de editar artigos com PDF ainda não foi implementada.');
      } else {
        const response = await api.post('/articles/import-pdf', submissionData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setArticles([...articles, response.data]);
      }
      resetForm();
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao guardar o artigo.';
      setError(errorMessage);
      console.error("Erro ao guardar artigo:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem a certeza que deseja excluir este artigo?')) {
      try {
        await api.delete(`/articles/${id}`);
        setArticles(articles.filter(article => article.id !== id));
      } catch (err) {
        setError('Ocorreu um erro ao excluir o artigo.');
        console.error("Erro ao excluir artigo:", err);
      }
    }
  };
  
  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', authors: '', edition_id: '', abstract: '', pdfFile: null });
    document.getElementById('pdfFileInput').value = '';
  };

  return (
    <main className="container">
      <div className="admin-page">
        <h1>Gestão de Artigos</h1>
        {error && <p className="error-message card">{error}</p>}

        <div className="admin-form-container card">
          <h2>{editingId ? 'Editar Artigo' : 'Cadastrar Novo Artigo'}</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Título do Artigo" required />
            <input type="text" name="authors" value={formData.authors} onChange={handleChange} placeholder="Autores (separados por vírgula)" required />
            <textarea name="abstract" value={formData.abstract} onChange={handleChange} placeholder="Resumo do Artigo"></textarea>
            
            <select name="edition_id" value={formData.edition_id} onChange={handleChange} required>
              <option value="">Selecione a Edição do Evento</option>
              {editions.map(edition => (
                <option key={edition.id} value={edition.id}>
                  {edition.eventName} - {edition.name} ({edition.year})
                </option>
              ))}
            </select>
            
            <label htmlFor="pdfFileInput">Ficheiro PDF do Artigo:</label>
            <input id="pdfFileInput" type="file" name="pdfFile" onChange={handleFileChange} accept="application/pdf" required />
            
            <div className="form-buttons">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Cadastrar Artigo'}</button>
            </div>
          </form>
        </div>

        <div className="admin-list-container">
          <h2>Artigos Cadastrados</h2>
          {loading && <p>A carregar artigos...</p>}
          {!loading && !error && (
            <ul>
              {articles.map(article => (
                <li key={article.id} className="card">
                  <div>
                    <strong>{article.title}</strong>
                    <span>{article.authors}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleDelete(article.id)} className="btn-danger">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

export default ArticleAdminPage;

