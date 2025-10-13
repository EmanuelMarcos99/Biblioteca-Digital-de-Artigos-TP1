import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './style/AdminPage.css';

function AdminPage() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      
      // --- MELHORIA: Verificar a integridade dos dados recebidos ---
      if (response.data && Array.isArray(response.data)) {
        // Verifica se o primeiro item (se existir) tem a propriedade 'id'
        if (response.data.length > 0 && typeof response.data[0].id === 'undefined') {
          setError('Erro: Os dados de eventos recebidos do servidor estão malformados (falta o ID). Contacte o responsável pelo backend.');
          console.error("Dados de eventos recebidos sem ID:", response.data);
          setEvents([]); // Garante que a lista fique vazia
        } else {
          setEvents(response.data);
          setError(null);
        }
      } else {
        setEvents([]);
      }

    } catch (err) {
      setError('Falha ao carregar os eventos. Verifique se o servidor backend está a correr.');
      console.error("Erro ao buscar eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert('Nome e Slug são obrigatórios.');
      return;
    }

    try {
      if (editingId) {
        const response = await api.put(`/events/${editingId}`, formData);
        setEvents(events.map(event => (event.id === editingId ? response.data : event)));
      } else {
        const response = await api.post('/events', formData);
        setEvents([...events, response.data]);
      }
      resetForm();
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao guardar o evento.';
      setError(errorMessage);
      console.error("Erro ao guardar evento:", err);
    }
  };
  
  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({ name: event.name, description: event.description || '', slug: event.slug });
  };

  const handleDelete = async (id) => {
    if (typeof id === 'undefined') {
      setError('Não foi possível excluir o evento: ID inválido.');
      console.error('handleDelete foi chamada com um ID indefinido.');
      return;
    }

    if (window.confirm('Tem a certeza que deseja excluir este evento?')) {
      try {
        await api.delete(`/events/${id}`);
        setEvents(events.filter(event => event.id !== id));
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao excluir o evento.';
        setError(errorMessage);
        console.error("Erro ao excluir evento:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', slug: '' });
  };

  return (
    <main className="container">
      <div className="admin-page">
        <h1>Gestão de Eventos</h1>

        {error && <p className="error-message card">{error}</p>}

        <div className="admin-form-container card">
          <h2>{editingId ? 'Editar Evento' : 'Cadastrar Novo Evento'}</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome do Evento" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrição"></textarea>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug (ex: sbrc, sbbd)" required />
            <div className="form-buttons">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Cadastrar Evento'}</button>
              {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="admin-list-container">
          <h2>Eventos Cadastrados</h2>
          {loading && <p>A carregar eventos...</p>}
          
          {/* A lista só será renderizada se não houver erro e o carregamento tiver terminado */}
          {!loading && !error && (
            <ul>
              {events.map(event => (
                <li key={event.id} className="card">
                  <div>
                    <strong>{event.name}</strong>
                    <span>Slug: {event.slug}</span>
                  </div>
                  <div className="item-actions">
                    <Link to={`/admin/events/${event.id}/editions`} className="btn-primary">
                      Gerir Edições
                    </Link>
                    <button onClick={() => handleEdit(event)} className="btn-secondary">Editar</button>
                    <button onClick={() => handleDelete(event.id)} className="btn-danger">Excluir</button>
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

export default AdminPage;
