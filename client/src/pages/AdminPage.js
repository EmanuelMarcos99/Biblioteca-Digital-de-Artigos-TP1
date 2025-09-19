import React, { useState } from 'react';
import './style/AdminPage.css'; // Importando o CSS para estilização

function AdminPage() {
  // ATENÇÃO: Estes dados são mocados. O próximo passo é buscar de uma API (GET /api/eventos).
  const [events, setEvents] = useState([
    { id: 1, name: 'Simpósio Brasileiro de Redes de Computadores', slug: 'sbrc', description: 'O SBRC é o mais importante evento científico sobre redes de computadores e sistemas distribuídos do Brasil.' },
    { id: 2, name: 'Simpósio Brasileiro de Banco de Dados', slug: 'sbbd', description: 'O SBBD é o evento oficial de banco de dados da Sociedade Brasileira de Computação (SBC).' },
  ]);

  // Estado para controlar os campos do formulário
  const [formData, setFormData] = useState({ name: '', description: '', slug: '' });
  // Estado para controlar se estamos editando ou criando (null = criando, id = editando)
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Função chamada ao clicar no botão Editar
  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({ name: event.name, description: event.description, slug: event.slug });
  };

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', slug: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert('Nome e Slug são obrigatórios!');
      return;
    }

    if (editingId) {
      // ATENÇÃO: Lógica de ATUALIZAÇÃO. O próximo passo é conectar com a API (PUT /api/eventos/:id).
      setEvents(events.map(event =>
        event.id === editingId ? { ...event, ...formData } : event
      ));
    } else {
      // ATENÇÃO: Lógica de CRIAÇÃO. O próximo passo é conectar com a API (POST /api/eventos).
      const newId = events.length > 0 ? Math.max(...events.map(ev => ev.id)) + 1 : 1;
      setEvents([...events, { id: newId, ...formData }]);
    }

    handleCancelEdit(); // Limpa o formulário e o estado de edição
  };

  const handleDelete = (eventId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      // ATENÇÃO: Lógica de EXCLUSÃO. O próximo passo é conectar com a API (DELETE /api/eventos/:id).
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  return (
    <main className="container">
      <div className="admin-page">
        <h1>Painel do Administrador</h1>
        <p>Aqui você pode gerenciar os eventos da biblioteca digital.</p>

        {/* Formulário de Cadastro e Edição */}
        <div className="admin-section">
          <h2>{editingId ? 'Editar Evento' : 'Cadastrar Novo Evento'}</h2>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="name">Nome do Evento</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="slug">Slug (URL amigável, ex: sbrc)</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Salvar Alterações' : 'Adicionar Evento'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listagem de Eventos */}
        <div className="admin-section">
          <h2>Eventos Cadastrados</h2>
          <ul className="event-list">
            {events.map(event => (
              <li key={event.id} className="event-item">
                <span>{event.name} ({event.slug})</span>
                <div className="event-actions">
                  <button onClick={() => handleEdit(event)} className="btn-secondary">Editar</button>
                  <button onClick={() => handleDelete(event.id)} className="btn-danger">Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default AdminPage;

