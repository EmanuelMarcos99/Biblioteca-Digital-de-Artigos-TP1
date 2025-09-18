import React from 'react';
// Importe os componentes do react-router
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importando componentes de layout
import Header from './components/Header';
import Footer from './components/Footer';

// Importando as novas páginas
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

// O App agora apenas gerencia as rotas
function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

