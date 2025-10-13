import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Importar o Provedor

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Envolver toda a aplicação com o Provedor de Autenticação */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

