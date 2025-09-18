import React from 'react';

// Componente para a barra de busca
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search-container">
      <h2>Explore nosso acervo</h2>
      <input
        type="text"
        placeholder="Buscar por título, autor ou palavra-chave..."
        className="search-input"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
}

export default SearchBar;
