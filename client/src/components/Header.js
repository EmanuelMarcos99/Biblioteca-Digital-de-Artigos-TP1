import React from 'react';
import { Link } from 'react-router-dom'; // Importe o Link para navegação
import './style/Header.css'; // Importa o CSS específico para o header

function Header() {
  return (
    <header className="app-header">
      <div className="container header-content">
        {/* O logo/título agora é um link para a página inicial */}
        <Link to="/" className="logo-link">
            <h1>Biblioteca Digital SBC</h1>
        </Link>
        
        {/* Menu de navegação */}
        <nav>
          <Link to="/">Home</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

