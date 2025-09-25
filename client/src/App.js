import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importando os componentes de página
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import EventEditionsPage from './pages/EventEditionsPage';
import ArticleAdminPage from './pages/ArticleAdminPage';
import BibtexImportPage from './pages/BibtexImportPage'; // Importar a nova página

// Importando componentes de layout
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <Routes>
          {/* Rota para a página inicial de busca */}
          <Route path="/" element={<HomePage />} />
          
          {/* Rota principal de admin agora redireciona para a gestão de eventos */}
          <Route path="/admin" element={<Navigate to="/admin/eventos" />} />

          {/* Rota para a página de administração de eventos */}
          <Route path="/admin/eventos" element={<AdminPage />} />

          {/* Rota dinâmica para gerir as edições de um evento */}
          <Route path="/admin/eventos/:eventId/edicoes" element={<EventEditionsPage />} />

          {/* Nova rota para a gestão de artigos */}
          <Route path="/admin/artigos" element={<ArticleAdminPage />} />

          {/* Nova rota para a importação BibTeX */}
          <Route path="/admin/importar" element={<BibtexImportPage />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

