import React, { useState, useEffect, useRef } from 'react';
import './style/SearchBar.css'; // Importar o novo CSS

function SearchBar({ searchTerm, onSearchChange, allDocuments = [] }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Efeito para lidar com cliques fora da barra de busca para fechar as sugestões
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleChange = (event) => {
    const value = event.target.value;
    onSearchChange(event); // Propaga a alteração para o componente pai

    if (value.length > 1) {
      const filteredSuggestions = allDocuments
        .filter(doc => doc.title.toLowerCase().includes(value.toLowerCase()))
        .map(doc => doc.title) // Queremos apenas os títulos
        .slice(0, 5); // Limitar a 5 sugestões
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Criamos um evento sintético para passar para o handler do componente pai
    onSearchChange({ target: { value: suggestion } });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <div className="search-bar-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Pesquisar por título, autor, evento..."
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)} // Mostra as sugestões ao focar se houver texto
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;

