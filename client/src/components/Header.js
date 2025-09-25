import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './style/Header.css'; // Usando a nova estrutura de CSS

function Header() {
  return (
    <header className="main-header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Biblioteca Digital SBC</h1>
        </Link>
        <nav className="main-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/admin/eventos">Gerir Eventos</NavLink>
          <NavLink to="/admin/artigos">Gerir Artigos</NavLink>
          {/* Novo link para a importação */}
          <NavLink to="/admin/importar">Importar BibTeX</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;

