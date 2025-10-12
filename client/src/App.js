import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importando componentes de página
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; // Nova página
import AdminPage from './pages/AdminPage';
import EventEditionsPage from './pages/EventEditionsPage';
import ArticleAdminPage from './pages/ArticleAdminPage';
import BibtexImportPage from './pages/BibtexImportPage';
import PublicEventPage from './pages/PublicEventPage';
import PublicEditionPage from './pages/PublicEditionPage';
import AuthorPage from './pages/AuthorPage';

// Importando componentes de layout e proteção
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute'; // Novo componente

function App() {
  const { loading } = useAuth();

  // Se a autenticação ainda estiver a carregar, pode mostrar um spinner global ou nada
  if (loading) {
    return <div>A carregar aplicação...</div>;
  }

  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/events/slug/:eventSlug" element={<PublicEventPage />} />
          <Route path="/events/slug/:eventSlug/:editionYear" element={<PublicEditionPage />} />
          <Route path="/authors/:authorName" element={<AuthorPage />} />

          {/* Rotas de Admin agora são protegidas */}
          <Route path="/admin" element={<ProtectedRoute><Navigate to="/admin/events" /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/events/:eventId/editions" element={<ProtectedRoute><EventEditionsPage /></ProtectedRoute>} />
          <Route path="/admin/articles" element={<ProtectedRoute><ArticleAdminPage /></ProtectedRoute>} />
          <Route path="/admin/import" element={<ProtectedRoute><BibtexImportPage /></ProtectedRoute>} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

