import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importar o hook de autenticação
import './style/Header.css';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="main-header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Biblioteca Digital SBC</h1>
        </Link>
        <nav className="main-nav">
          <NavLink to="/" end>Home</NavLink>
          {/* Mostra os links de admin apenas se o utilizador estiver autenticado */}
          {isAuthenticated && (
            <>
              <NavLink to="/admin/events">Gerir Eventos</NavLink>
              <NavLink to="/admin/articles">Gerir Artigos</NavLink>
              <NavLink to="/admin/import">Importar BibTeX</NavLink>
            </>
          )}
        </nav>
        <div className="user-actions">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">Olá, {user.name}!</span>
              <button onClick={logout} className="btn-secondary">Logout</button>
            </>
          ) : (
            <NavLink to="/login" className="btn-primary">Login</NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

