import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importando os componentes de página
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import EventEditionsPage from './pages/EventEditionsPage';
import ArticleAdminPage from './pages/ArticleAdminPage';
import BibtexImportPage from './pages/BibtexImportPage';
import PublicEventPage from './pages/PublicEventPage';
import PublicEditionPage from './pages/PublicEditionPage';
import AuthorPage from './pages/AuthorPage';

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
          <Route path="/events/slug/:eventSlug" element={<PublicEventPage />} />
          <Route path="/events/slug/:eventSlug/:editionYear" element={<PublicEditionPage />} />
          <Route path="/authors/:authorName" element={<AuthorPage />} />

          {/* Rotas de Admin */}
          <Route path="/admin" element={<Navigate to="/admin/events" />} />
          <Route path="/admin/events" element={<AdminPage />} />
          <Route path="/admin/events/:eventId/editions" element={<EventEditionsPage />} />
          <Route path="/admin/articles" element={<ArticleAdminPage />} />
          <Route path="/admin/import" element={<BibtexImportPage />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

