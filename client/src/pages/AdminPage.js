import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Importar o nosso serviço de API
import './style/AdminPage.css';

function AdminPage() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar os eventos da API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // A rota no backend é /api/eventos
      const response = await api.get('/eventos');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar os eventos. Verifique se o servidor backend está a correr.');
      console.error("Erro ao buscar eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar os dados iniciais quando o componente é montado
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
        // --- ATENÇÃO: Lógica de Atualização (PUT) ---
        const response = await api.put(`/eventos/${editingId}`, formData);
        setEvents(events.map(event => (event.id === editingId ? response.data : event)));
      } else {
        // --- ATENÇÃO: Lógica de Criação (POST) ---
        const response = await api.post('/eventos', formData);
        setEvents([...events, response.data]);
      }
      resetForm();
    } catch (err) {
      setError('Ocorreu um erro ao guardar o evento.');
      console.error("Erro ao guardar evento:", err);
    }
  };
  
  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({ name: event.name, description: event.description || '', slug: event.slug });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem a certeza que deseja excluir este evento?')) {
      try {
        // --- ATENÇÃO: Lógica de Exclusão (DELETE) ---
        await api.delete(`/eventos/${id}`);
        setEvents(events.filter(event => event.id !== id));
      } catch (err) {
        setError('Ocorreu um erro ao excluir o evento.');
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

        <div className="admin-form-container card">
          <h2>{editingId ? 'Editar Evento' : 'Cadastrar Novo Evento'}</h2>
          <form onSubmit={handleSubmit}>
            {/* ... campos do formulário ... */}
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
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && (
            <ul>
              {events.map(event => (
                <li key={event.id} className="card">
                  <div>
                    <strong>{event.name}</strong>
                    <span>Slug: {event.slug}</span>
                  </div>
                  <div className="item-actions">
                    <Link to={`/admin/eventos/${event.id}/edicoes`} className="btn-primary">
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

