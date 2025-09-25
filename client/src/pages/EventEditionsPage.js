import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './style/EventEditionsPage.css'; // Usando a nova estrutura de CSS

// Dados de exemplo que viriam do seu backend (API)
const mockEvents = [
  { id: 1, name: 'Simpósio Brasileiro de Redes de Computadores', slug: 'sbrc' },
  { id: 2, name: 'Simpósio Brasileiro de Banco de Dados', slug: 'sbbd' },
];

const mockEditions = {
  1: [{ id: 101, year: 2023, location: 'Brasília - DF', startDate: '2023-05-22', endDate: '2023-05-26' }],
  2: [{ id: 201, year: 2023, location: 'Fortaleza - CE', startDate: '2023-10-02', endDate: '2023-10-06' }],
};

function EventEditionsPage() {
  const { eventId } = useParams(); // Pega o ID do evento da URL
  const currentEvent = mockEvents.find(e => e.id === parseInt(eventId));
  
  const [editions, setEditions] = useState(mockEditions[eventId] || []);
  const [formData, setFormData] = useState({ year: '', location: '', startDate: '', endDate: '' });
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleEdit = (edition) => {
    setEditingId(edition.id);
    setFormData({ year: edition.year, location: edition.location, startDate: edition.startDate, endDate: edition.endDate });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ year: '', location: '', startDate: '', endDate: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.year || !formData.location) {
      alert('Ano e Local são obrigatórios!');
      return;
    }

    if (editingId) {
      // ATENÇÃO: Lógica de ATUALIZAÇÃO (PUT /api/edicoes/:id)
      setEditions(editions.map(ed => ed.id === editingId ? { ...ed, ...formData } : ed));
    } else {
      // ATENÇÃO: Lógica de CRIAÇÃO (POST /api/eventos/:eventId/edicoes)
      const newId = editions.length > 0 ? Math.max(...editions.map(ed => ed.id)) + 1 : 1;
      setEditions([...editions, { id: newId, ...formData }]);
    }
    handleCancelEdit();
  };
  
  const handleDelete = (editionId) => {
    if (window.confirm('Tem certeza que deseja excluir esta edição?')) {
      // ATENÇÃO: Lógica de EXCLUSÃO (DELETE /api/edicoes/:id)
      setEditions(editions.filter(ed => ed.id !== editionId));
    }
  };

  if (!currentEvent) {
    return (
        <main className="container">
            <p>Evento não encontrado!</p>
            <Link to="/admin">Voltar para a lista de eventos.</Link>
        </main>
    );
  }

  return (
    <main className="container">
      <div className="admin-page">
        <Link to="/admin" className="back-link">&larr; Voltar para Eventos</Link>
        <h1>Gerir Edições de: {currentEvent.name}</h1>
        
        <div className="admin-section">
          <h2>{editingId ? 'Editar Edição' : 'Adicionar Nova Edição'}</h2>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="year">Ano</label>
              <input type="number" id="year" name="year" placeholder="Ex: 2024" value={formData.year} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="location">Local</label>
              <input type="text" id="location" name="location" placeholder="Ex: São Paulo - SP" value={formData.location} onChange={handleInputChange} required />
            </div>
             <div className="form-group">
              <label htmlFor="startDate">Data de Início</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} />
            </div>
             <div className="form-group">
              <label htmlFor="endDate">Data de Fim</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Salvar Alterações' : 'Adicionar Edição'}</button>
              {editingId && <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="admin-section">
          <h2>Edições Cadastradas</h2>
          {editions.length === 0 ? (
            <p>Nenhuma edição cadastrada para este evento ainda.</p>
          ) : (
            <ul className="event-list">
              {editions.map(edition => (
                <li key={edition.id} className="event-item">
                  <span>{edition.year} - {edition.location}</span>
                  <div className="event-actions">
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

