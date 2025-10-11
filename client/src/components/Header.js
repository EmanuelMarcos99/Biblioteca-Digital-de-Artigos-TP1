import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './style/Header.css';

function Header() {
  return (
    <header className="main-header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Biblioteca Digital SBC</h1>
        </Link>
        <nav className="main-nav">
          <NavLink to="/" end>Home</NavLink>
          {/* CORREÇÃO: Usar o caminho em inglês */}
          <NavLink to="/admin/events">Gerir Eventos</NavLink>
          <NavLink to="/admin/articles">Gerir Artigos</NavLink>
          <NavLink to="/admin/import">Importar BibTeX</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;