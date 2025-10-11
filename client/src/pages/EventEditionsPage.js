import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Importar o nosso serviço de API
import './style/EventEditionsPage.css';

function EventEditionsPage() {
  const { eventId } = useParams(); // Obtém o ID do evento do URL
  
  const [editions, setEditions] = useState([]);
  const [eventName, setEventName] = useState('');
  const [formData, setFormData] = useState({ ano: '', local: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para buscar os dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Busca os detalhes do evento para obter o nome (poderia ser uma rota /eventos/:id)
        const eventsResponse = await api.get('/eventos');
        const currentEvent = eventsResponse.data.find(e => e.id === parseInt(eventId));
        if (currentEvent) {
          setEventName(currentEvent.name);
        }

        // Busca as edições para este evento específico
        const editionsResponse = await api.get(`/eventos/${eventId}/edicoes`);
        setEditions(editionsResponse.data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os dados das edições.');
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]); // Re-executa se o eventId mudar

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ano) {
      alert('O ano é obrigatório.');
      return;
    }

    try {
      if (editingId) {
        // --- ATENÇÃO: Lógica de Atualização (PUT /api/edicoes/:id) ---
        const response = await api.put(`/edicoes/${editingId}`, formData);
        setEditions(editions.map(ed => (ed.id === editingId ? response.data : ed)));
      } else {
        // --- ATENÇÃO: Lógica de Criação (POST /api/eventos/:eventId/edicoes) ---
        const response = await api.post(`/eventos/${eventId}/edicoes`, formData);
        setEditions([...editions, response.data]);
      }
      resetForm();
    } catch (err) {
      setError('Ocorreu um erro ao guardar a edição.');
      console.error("Erro ao guardar edição:", err);
    }
  };

  const handleEdit = (edition) => {
    setEditingId(edition.id);
    setFormData({ ano: edition.ano, local: edition.local || '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem a certeza que deseja excluir esta edição?')) {
      try {
        // --- ATENÇÃO: Lógica de Exclusão (DELETE /api/edicoes/:id) ---
        await api.delete(`/edicoes/${id}`);
        setEditions(editions.filter(ed => ed.id !== id));
      } catch (err) {
        setError('Ocorreu um erro ao excluir a edição. Verifique se não existem artigos associados.');
        console.error("Erro ao excluir edição:", err);
      }
    }
  };
  
  const resetForm = () => {
    setEditingId(null);
    setFormData({ ano: '', local: '' });
  };

  return (
    <main className="container">
      <div className="admin-page">
        <Link to="/admin/eventos" className="back-link">&larr; Voltar para Eventos</Link>
        <h1>Gestão de Edições para: {eventName}</h1>

        <div className="admin-form-container card">
          <h2>{editingId ? 'Editar Edição' : 'Cadastrar Nova Edição'}</h2>
          <form onSubmit={handleSubmit}>
            <input type="number" name="ano" value={formData.ano} onChange={handleChange} placeholder="Ano da Edição" required />
            <input type="text" name="local" value={formData.local} onChange={handleChange} placeholder="Local (ex: São Paulo)" />
            <div className="form-buttons">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Cadastrar Edição'}</button>
              {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="admin-list-container">
          <h2>Edições Cadastradas</h2>
          {loading && <p>A carregar edições...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && (
            <ul>
              {editions.map(edition => (
                <li key={edition.id} className="card">
                  <div>
                    <strong>Ano: {edition.ano}</strong>
                    <span>Local: {edition.local || 'Não especificado'}</span>
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

