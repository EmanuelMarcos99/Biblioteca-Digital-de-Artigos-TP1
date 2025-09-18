import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Este código encontra a <div id="root"> no seu index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// E renderiza o seu componente principal <App /> dentro dela.
// O <React.StrictMode> é um ajudante que detecta potenciais problemas na sua app.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
