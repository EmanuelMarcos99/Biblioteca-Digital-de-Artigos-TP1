import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './style/AdminPage.css';

function AdminPage() {
  const [events, setEvents] = useState([]);
  // --- CORREÇÃO: Usar os nomes dos campos em inglês para corresponder ao backend ---
  const [formData, setFormData] = useState({ name: '', description: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
      setError(null);
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
    // --- CORREÇÃO: Validar 'name' em vez de 'nome' ---
    if (!formData.name || !formData.slug) {
      alert('Nome e Slug são obrigatórios.');
      return;
    }

    try {
      // O objeto formData já está no formato correto { name, description, slug }
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
    // --- CORREÇÃO: Usar os nomes dos campos em inglês ---
    setFormData({ name: event.name, description: event.description || '', slug: event.slug });
  };

  const handleDelete = async (id) => {
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
    // --- CORREÇÃO: Usar os nomes dos campos em inglês ---
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
            {/* --- CORREÇÃO: Atualizar o atributo 'name' dos inputs --- */}
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
          {!loading && !error && (
            <ul>
              {events.map(event => (
                <li key={event.id} className="card">
                  <div>
                    <strong>{event.name}</strong> {/* CORREÇÃO: 'event.name' */}
                    <span>Slug: {event.slug}</span>
                  </div>
                  <div className="item-actions">
                    {/* ATENÇÃO: Esta rota também pode precisar de ser atualizada para inglês no App.js */}
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

