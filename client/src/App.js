import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importando os componentes de página
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import EventEditionsPage from './pages/EventEditionsPage';

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
          
          {/* Rota para a página principal de administração de eventos */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Nova rota dinâmica para gerir as edições de um evento específico */}
          <Route path="/admin/eventos/:eventId/edicoes" element={<EventEditionsPage />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

