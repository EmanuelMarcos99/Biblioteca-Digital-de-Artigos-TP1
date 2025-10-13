import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './style/EventEditionsPage.css';

function EventEditionsPage() {
  const { eventId } = useParams();
  
  const [editions, setEditions] = useState([]);
  const [eventName, setEventName] = useState('');
  // --- CORREÇÃO: Adicionar os novos campos obrigatórios ---
  const [formData, setFormData] = useState({ year: '', location: '', name: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const eventResponse = await api.get(`/events/${eventId}`);
        if (eventResponse.data) {
          setEventName(eventResponse.data.name);
        }

        const editionsResponse = await api.get(`/events/${eventId}/editions`);
        setEditions(editionsResponse.data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os dados das edições.');
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // --- CORREÇÃO: Validar os novos campos ---
    if (!formData.year || !formData.name || !formData.slug) {
      alert('Ano, Nome e Slug da edição são obrigatórios.');
      return;
    }

    try {
      if (editingId) {
        const response = await api.put(`/editions/${editingId}`, formData);
        setEditions(editions.map(ed => (ed.id === editingId ? response.data : ed)));
      } else {
        const response = await api.post(`/events/${eventId}/editions`, formData);
        setEditions([...editions, response.data]);
      }
      resetForm();
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao guardar a edição.';
      setError(errorMessage);
      console.error("Erro ao guardar edição:", err);
    }
  };

  const handleEdit = (edition) => {
    setEditingId(edition.id);
    // --- CORREÇÃO: Preencher os novos campos para edição ---
    setFormData({ 
      year: edition.year, 
      location: edition.location || '', 
      name: edition.name || '', 
      slug: edition.slug || '' 
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem a certeza que deseja excluir esta edição?')) {
      try {
        await api.delete(`/editions/${id}`);
        setEditions(editions.filter(ed => ed.id !== id));
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao excluir a edição.';
        setError(errorMessage);
        console.error("Erro ao excluir edição:", err);
      }
    }
  };
  
  const resetForm = () => {
    setEditingId(null);
    // --- CORREÇÃO: Limpar os novos campos ---
    setFormData({ year: '', location: '', name: '', slug: '' });
  };

  return (
    <main className="container">
      <div className="admin-page">
        <Link to="/admin/events" className="back-link">&larr; Voltar para Eventos</Link>
        <h1>Gestão de Edições para: {eventName}</h1>

        {error && <p className="error-message card">{error}</p>}

        <div className="admin-form-container card">
          <h2>{editingId ? 'Editar Edição' : 'Cadastrar Nova Edição'}</h2>
          <form onSubmit={handleSubmit}>
            {/* --- CORREÇÃO: Adicionar os novos campos ao formulário --- */}
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome da Edição (ex: SBRC 2024)" required />
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug da Edição (ex: sbrc-2024)" required />
            <input type="text" pattern="\d*" name="year" value={formData.year} onChange={handleChange} placeholder="Ano da Edição" required />
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Local (ex: São Paulo)" />
            <div className="form-buttons">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Cadastrar Edição'}</button>
              {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="admin-list-container">
          <h2>Edições Cadastradas</h2>
          {loading && <p>A carregar edições...</p>}
          {!loading && !error && (
            <ul>
              {editions.map(edition => (
                <li key={edition.id} className="card">
                  <div>
                    <strong>{edition.name} ({edition.year})</strong>
                    <span>Local: {edition.location || 'Não especificado'}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(edition)} className="btn-secondary">Editar</button>
                    <button onClick={() => handleDelete(edition.id)} className="btn-danger">Excluir</button>
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

export default EventEditionsPage;

