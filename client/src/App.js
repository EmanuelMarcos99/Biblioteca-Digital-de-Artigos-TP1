import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importando os componentes de página
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import EventEditionsPage from './pages/EventEditionsPage';
import ArticleAdminPage from './pages/ArticleAdminPage';
import BibtexImportPage from './pages/BibtexImportPage';
import PublicEventPage from './pages/PublicEventPage'; // Nova página
import PublicEditionPage from './pages/PublicEditionPage'; // Nova página

// Importando componentes de layout
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/eventos/:eventSlug" element={<PublicEventPage />} />
          <Route path="/eventos/:eventSlug/:editionYear" element={<PublicEditionPage />} />

          {/* Rotas de Admin */}
          <Route path="/admin" element={<Navigate to="/admin/eventos" />} />
          <Route path="/admin/eventos" element={<AdminPage />} />
          <Route path="/admin/eventos/:eventId/edicoes" element={<EventEditionsPage />} />
          <Route path="/admin/artigos" element={<ArticleAdminPage />} />
          <Route path="/admin/importar" element={<BibtexImportPage />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

