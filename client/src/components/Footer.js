import React from 'react';

// Componente para o rodapé da página
function Footer() {
    return (
        <footer className="app-footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Biblioteca Digital - Desenvolvido por Emanuel Figueiredo e Ezequiel Moreira.</p>
            </div>
        </footer>
    );
}

export default Footer;
