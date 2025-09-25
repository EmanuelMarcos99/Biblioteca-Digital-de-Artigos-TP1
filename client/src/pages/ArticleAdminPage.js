import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './style/ArticleAdminPage.css';

// Dados de exemplo que viriam do seu backend
const mockArticles = [
  { id: 1, title: 'Uma Abordagem Baseada em Aprendizado Profundo...', authors: 'João Silva, Maria Oliveira', year: 2023, event: 'SBRC' },
  { id: 2, title: 'Análise de Desempenho de Algoritmos...', authors: 'Carlos Pereira, Ana Souza', year: 2022, event: 'SBBD' },
];

function ArticleAdminPage() {
  const [articles, setArticles] = useState(mockArticles);
  const [formData, setFormData] = useState({ title: '', authors: '', year: '', event: '', pdf: null });
  const [editingId, setEditingId] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({ ...prevState, pdf: e.target.files[0] }));
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setFormData({ title: article.title, authors: article.authors, year: article.year, event: article.event, pdf: null });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', authors: '', year: '', event: '', pdf: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.authors) {
      alert('Título e Autores são obrigatórios!');
      return;
    }

    if (editingId) {
      // ATENÇÃO: Lógica de ATUALIZAÇÃO (PUT /api/artigos/:id) - FormData para o upload
      setArticles(articles.map(art => art.id === editingId ? { ...art, ...formData } : art));
    } else {
       // ATENÇÃO: Lógica de CRIAÇÃO (POST /api/artigos) - FormData para o upload
      const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
      setArticles([...articles, { id: newId, ...formData }]);
    }
    handleCancelEdit();
  };
  
  const handleDelete = (articleId) => {
    if (window.confirm('Tem certeza que deseja excluir este artigo?')) {
       // ATENÇÃO: Lógica de EXCLUSÃO (DELETE /api/artigos/:id)
      setArticles(articles.filter(art => art.id !== articleId));
    }
  };

  return (
    <main className="container">
      <div className="admin-page">
        <h1>Gestão de Artigos</h1>
        
        <div className="admin-section">
          <h2>{editingId ? 'Editar Artigo' : 'Cadastrar Novo Artigo'}</h2>
          <form onSubmit={handleSubmit} className="event-form" encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="title">Título</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="authors">Autores (separados por vírgula)</label>
              <input type="text" id="authors" name="authors" value={formData.authors} onChange={handleInputChange} required />
            </div>
             <div className="form-group">
              <label htmlFor="year">Ano de Publicação</label>
              <input type="number" id="year" name="year" value={formData.year} onChange={handleInputChange} />
            </div>
             <div className="form-group">
              <label htmlFor="event">Evento</label>
              <input type="text" id="event" name="event" value={formData.event} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="pdf">Ficheiro PDF</label>
              <input type="file" id="pdf" name="pdf" accept=".pdf" onChange={handleFileChange} />
              {editingId && <small>Deixe em branco para manter o PDF atual.</small>}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Cadastrar Artigo'}</button>
              {editingId && <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="admin-section">
          <h2>Artigos Cadastrados</h2>
            <ul className="event-list">
              {articles.map(article => (
                <li key={article.id} className="event-item">
                  <span>{article.title}</span>
                  <div className="event-actions">
                    <button onClick={() => handleEdit(article)} className="btn-secondary">Editar</button>
                    <button onClick={() => handleDelete(article.id)} className="btn-danger">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
        </div>
      </div>
    </main>
  );
}

export default ArticleAdminPage;
